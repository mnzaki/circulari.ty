// Based on https://github.com/meditto/tauri-drizzle-proxy/
// with fixes for edge cases

use base64::engine::general_purpose;
use base64::Engine;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{
    query::Query,
    sqlite::{SqliteArguments, SqliteRow},
    Column, Row, Sqlite, SqlitePool, TypeInfo,
};
use std::path::PathBuf;
use tauri::Manager;
use tauri::{command, AppHandle};

#[derive(Debug, Deserialize)]
pub struct SqlQuery {
    pub sql: String,
    pub params: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct SqlRow {
    pub columns: Vec<String>,
    pub values: Vec<serde_json::Value>,
}

#[command]
pub async fn run_sql(app: AppHandle, query: SqlQuery) -> Result<Vec<SqlRow>, String> {
    let db_path = get_app_db_path(&app)?;
    let uri = format!("sqlite://{}", db_path.display());

    if !db_path.parent().unwrap().exists() {
        println!("[DRIZZLE_PROXY] Creating parent directory for database");
        std::fs::create_dir_all(db_path.parent().unwrap()).unwrap();
    }

    let pool = SqlitePool::connect(&uri)
        .await
        .map_err(|e| {
            println!("[DRIZZLE_PROXY] FAILED to connect to DB: {}", e);
            format!("Failed to connect to DB: {}", e)
        })?;

    let mut q = sqlx::query(&query.sql);
    for (i, param) in query.params.iter().enumerate() {
        q = bind_value(q, param);
    }

    let rows = q
        .fetch_all(&pool)
        .await
        .map_err(|e| {
            println!("[DRIZZLE_PROXY] Query FAILED: {}", e);
            format!("Query failed: {}", e)
        })?;

    let result: Vec<SqlRow> = rows
        .iter()
        .enumerate()
        .map(|(row_idx, row)| {
            let columns = row
                .columns()
                .iter()
                .map(|c| c.name().to_string())
                .collect::<Vec<_>>();

            let values = (0..row.len())
                .enumerate()
                .map(|(col_idx, i)| {
                    let col_name = columns.get(i).map(|s| s.as_str()).unwrap_or("?");
                    match row.try_get_raw(i) {
                        Ok(_) => {
                            let value = sqlx_value_to_json(row, i);
                            value
                        },
                        Err(e) => {
                            Value::Null
                        },
                    }
                })
                .collect::<Vec<_>>();

            SqlRow { columns, values }
        })
        .collect();

    // Close the pool explicitly to avoid any connection issues
    // FIXME should we do this? are they actually closing connections or just this pool reference?
    pool.close().await;

    Ok(result)
}

fn get_app_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir() // FIXME app_data_dir for more space??!??!?!
        .map(|p| p.join("deardiary.db"))
        .map_err(|_| "Could not resolve app data directory".to_string())
}

fn bind_value<'q>(
    query: Query<'q, Sqlite, SqliteArguments<'q>>,
    value: &'q Value,
) -> Query<'q, Sqlite, SqliteArguments<'q>> {
    let result = match value {
        Value::Null => {
            query.bind(None::<String>)
        },
        Value::Bool(b) => {
            query.bind(*b)
        },
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                query.bind(i)
            } else if let Some(f) = n.as_f64() {
                query.bind(f)
            } else {
                // println!("[DRIZZLE_PROXY] Binding number (unknown type) as NULL");
                query.bind(None::<String>)
            }
        },
        Value::String(s) => {
            query.bind(s)
        },
        _ => {
            println!("[DRIZZLE_PROXY] Binding unknown type as NULL: {:?}", value);
            query.bind(None::<String>)
        },
    };
    result
}

fn sqlx_value_to_json(row: &SqliteRow, index: usize) -> Value {
    let column = row.column(index);
    let type_name = column.type_info().name();

    // For NULL type (computed columns like COUNT(*)), try INTEGER first, then fall back
    if type_name == "NULL" || type_name.is_empty() {
        //println!("[DRIZZLE_PROXY] Type is NULL/empty, trying INTEGER first...");
        if let Ok(val) = row.try_get::<i64, _>(index) {
            //println!("[DRIZZLE_PROXY] Got INTEGER: {}", val);
            return Value::from(val);
        }
        //println!("[DRIZZLE_PROXY] INTEGER failed, trying REAL...");
        if let Ok(val) = row.try_get::<f64, _>(index) {
            //println!("[DRIZZLE_PROXY] Got REAL: {}", val);
            return Value::from(val);
        }
        //println!("[DRIZZLE_PROXY] REAL failed, trying TEXT...");
        if let Ok(val) = row.try_get::<String, _>(index) {
            //println!("[DRIZZLE_PROXY] Got TEXT: {}", val);
            return Value::String(val);
        }
        //println!("[DRIZZLE_PROXY] All type attempts failed, returning NULL");
        return Value::Null;
    }

    match type_name {
        "INTEGER" => {
            let result = row
                .try_get::<i64, _>(index)
                .map(Value::from)
                .unwrap_or(Value::Null);
            //println!("[DRIZZLE_PROXY] INTEGER -> {:?}", result);
            result
        },
        "REAL" => {
            let result = row
                .try_get::<f64, _>(index)
                .map(Value::from)
                .unwrap_or(Value::Null);
            //println!("[DRIZZLE_PROXY] REAL -> {:?}", result);
            result
        },
        "TEXT" => {
            let result = row
                .try_get::<String, _>(index)
                .map(Value::String)
                .unwrap_or(Value::Null);
            //println!("[DRIZZLE_PROXY] TEXT -> {:?}", result);
            result
        },
        "BLOB" => {
            let result = row
                .try_get::<Vec<u8>, _>(index)
                .map(|bytes| Value::String(general_purpose::STANDARD.encode(&bytes)))
                .unwrap_or(Value::Null);
            //println!("[DRIZZLE_PROXY] BLOB -> {:?}", result);
            result
        },
        _ => {
            // Unknown type, try them all
            //println!("[DRIZZLE_PROXY] UNKNOWN type '{}', trying all...", type_name);
            if let Ok(val) = row.try_get::<i64, _>(index) {
                //println!("[DRIZZLE_PROXY] Got INTEGER: {}", val);
                return Value::from(val);
            }
            if let Ok(val) = row.try_get::<f64, _>(index) {
                //println!("[DRIZZLE_PROXY] Got REAL: {}", val);
                return Value::from(val);
            }
            if let Ok(val) = row.try_get::<String, _>(index) {
                //println!("[DRIZZLE_PROXY] Got TEXT: {}", val);
                return Value::String(val);
            }
            //println!("[DRIZZLE_PROXY] All attempts failed for unknown type");
            Value::Null
        },
    }
}
