use serde::Serialize;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use image::{imageops::FilterType, GenericImageView};

// Constants for media handling
const MAX_REMOTE_MEDIA_SIZE_FOR_ANALYSIS: u64 = 10 * 1024 * 1024; // 10MB
const MAX_REMOTE_MEDIA_SIZE_FOR_SAVING: u64 = 50 * 1024 * 1024; // 50MB
const PARTIAL_DOWNLOAD_SIZE: usize = 64 * 1024; // 64KB
const THUMBNAIL_SIZE: u32 = 300; // 300px max dimension

#[derive(Serialize, Debug)]
pub struct MediaPreviewJSON {
    pub url: String,
    pub media_type: String, // "image", "video", "audio", "unknown"
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub duration: Option<f64>, // in seconds
    pub file_size: Option<u64>,
    pub thumbnail_path: Option<String>, // path to cached thumbnail
    pub metadata: MediaMetadata,
}

#[derive(Serialize, Debug, Default)]
pub struct MediaMetadata {
    pub title: Option<String>,
    pub description: Option<String>,
    pub created_at: Option<String>, // ISO 8601
    pub camera_make: Option<String>,
    pub camera_model: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
}

#[derive(Serialize, Debug)]
pub enum PreviewType {
    Html(HtmlPreview),
    Media(MediaPreviewJSON),
    Unknown,
}

#[derive(Serialize, Debug)]
pub struct HtmlPreview {
    pub title: Option<String>,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub images: Vec<String>,
    pub site_name: Option<String>,
}

#[tauri::command]
pub async fn url_preview_json(app: AppHandle, url: String) -> Result<PreviewType, String> {
    println!("[URL_PREVIEW] Processing URL: {}", url);
    
    // Determine URL type based on extension or content-type
    if is_media_url(&url) {
        println!("[URL_PREVIEW] Detected as media URL");
        match media_preview_json(app, url.clone()).await {
            Ok(preview) => Ok(PreviewType::Media(preview)),
            Err(e) => {
                println!("[URL_PREVIEW] Media preview failed: {}, falling back to HTML", e);
                // Fall back to HTML preview if media fails
                match html_preview(url).await {
                    Ok(preview) => Ok(PreviewType::Html(preview)),
                    Err(_) => Ok(PreviewType::Unknown),
                }
            }
        }
    } else {
        println!("[URL_PREVIEW] Detected as HTML URL");
        match html_preview(url).await {
            Ok(preview) => Ok(PreviewType::Html(preview)),
            Err(_) => Ok(PreviewType::Unknown),
        }
    }
}

fn is_media_url(url: &str) -> bool {
    let lower = url.to_lowercase();
    lower.ends_with(".jpg") || lower.ends_with(".jpeg") || 
    lower.ends_with(".png") || lower.ends_with(".gif") || 
    lower.ends_with(".webp") || lower.ends_with(".mp4") ||
    lower.ends_with(".mov") || lower.ends_with(".webm") ||
    lower.ends_with(".mp3") || lower.ends_with(".m4a") ||
    lower.ends_with(".ogg") || lower.ends_with(".wav")
}

async fn html_preview(url: String) -> Result<HtmlPreview, String> {
    // Import and call the html_preview module
    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to fetch page: {}", e))?;
    
    let _html_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    // Basic HTML parsing - simplified version
    // In production, we'd use the full html_preview module
    Ok(HtmlPreview {
        title: None,
        description: None,
        image_url: None,
        images: vec![],
        site_name: None,
    })
}

#[tauri::command]
pub async fn media_preview_json(app: AppHandle, url: String) -> Result<MediaPreviewJSON, String> {
    println!("[MEDIA_PREVIEW] Processing media URL: {}", url);
    
    // Check if it's a remote URL
    let is_remote = url.starts_with("http://") || url.starts_with("https://");
    
    let (file_path, file_size, is_temp) = if is_remote {
        println!("[MEDIA_PREVIEW] Remote media detected");
        handle_remote_media(&app, &url).await?
    } else {
        println!("[MEDIA_PREVIEW] Local media detected");
        let path = std::path::PathBuf::from(&url);
        let size = std::fs::metadata(&path)
            .map(|m| m.len())
            .ok();
        (path, size, false)
    };
    
    println!("[MEDIA_PREVIEW] File at: {:?}, size: {:?}", file_path, file_size);
    
    // Analyze media file
    let mut preview = analyze_media_file(&file_path, &url).await?;
    preview.file_size = file_size;
    
    // Create thumbnail for images if we have the full file
    if preview.media_type == "image" && !is_temp {
        if let Ok(thumb_path) = create_thumbnail(&app, &file_path, &url).await {
            preview.thumbnail_path = Some(thumb_path);
        }
    }
    
    // Clean up temp file if needed
    if is_temp && file_path.exists() {
        println!("[MEDIA_PREVIEW] Cleaning up temp file: {:?}", file_path);
        let _ = std::fs::remove_file(&file_path);
    }
    
    println!("[MEDIA_PREVIEW] Preview complete: {:?}", preview);
    Ok(preview)
}

async fn handle_remote_media(app: &AppHandle, url: &str) -> Result<(PathBuf, Option<u64>, bool), String> {
    // HEAD request to get size
    let client = reqwest::Client::new();
    let head_resp = client.head(url)
        .send()
        .await
        .map_err(|e| format!("HEAD request failed: {}", e))?;
    
    let content_length = head_resp.headers()
        .get("content-length")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse::<u64>().ok());
    
    println!("[MEDIA_PREVIEW] Content-Length: {:?}", content_length);
    
    // Determine download strategy
    let download_full = content_length.map_or(false, |size| {
        size <= MAX_REMOTE_MEDIA_SIZE_FOR_ANALYSIS
    });
    
    let should_save = content_length.map_or(false, |size| {
        size <= MAX_REMOTE_MEDIA_SIZE_FOR_SAVING
    });
    
    // Download file
    let temp_dir = std::env::temp_dir();
    let temp_filename = format!("deardiary_media_{}", uuid::Uuid::new_v4());
    let temp_path = temp_dir.join(&temp_filename);
    
    if download_full {
        println!("[MEDIA_PREVIEW] Downloading full file");
        let bytes = client.get(url)
            .send()
            .await
            .map_err(|e| format!("Download failed: {}", e))?
            .bytes()
            .await
            .map_err(|e| format!("Read failed: {}", e))?;
        
        std::fs::write(&temp_path, &bytes)
            .map_err(|e| format!("Write failed: {}", e))?;
        
        let size = bytes.len() as u64;
        
        if should_save {
            // Move to permanent storage
            let perm_path = get_media_storage_path(app, url)?;
            println!("[MEDIA_PREVIEW] Moving to permanent storage: {:?}", perm_path);
            std::fs::create_dir_all(perm_path.parent().unwrap())
                .map_err(|e| format!("Create dir failed: {}", e))?;
            std::fs::copy(&temp_path, &perm_path)
                .map_err(|e| format!("Copy failed: {}", e))?;
            
            // Clean up temp
            let _ = std::fs::remove_file(&temp_path);
            
            Ok((perm_path, Some(size), false))
        } else {
            Ok((temp_path, Some(size), true))
        }
    } else {
        // Partial download for analysis
        println!("[MEDIA_PREVIEW] Downloading partial ({} bytes)", PARTIAL_DOWNLOAD_SIZE);
        let partial = client.get(url)
            .header("Range", format!("bytes=0-{}", PARTIAL_DOWNLOAD_SIZE - 1))
            .send()
            .await
            .map_err(|e| format!("Partial download failed: {}", e))?
            .bytes()
            .await
            .map_err(|e| format!("Read failed: {}", e))?;
        
        std::fs::write(&temp_path, &partial)
            .map_err(|e| format!("Write failed: {}", e))?;
        
        Ok((temp_path, content_length, true))
    }
}

fn get_media_storage_path(app: &AppHandle, url: &str) -> Result<PathBuf, String> {
    let app_dir = app.path()
        .app_data_dir()
        .map_err(|_| "Could not resolve app data directory".to_string())?;
    
    let media_dir = app_dir.join("media");
    
    // Create a filename from URL hash
    let url_hash = blake3::hash(url.as_bytes()).to_hex().to_string();
    let extension = std::path::Path::new(url)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("bin");
    
    Ok(media_dir.join(format!("{}.{}", &url_hash[..16], extension)))
}

fn get_thumbnail_cache_path(app: &AppHandle, url: &str) -> Result<PathBuf, String> {
    let app_dir = app.path()
        .app_data_dir()
        .map_err(|_| "Could not resolve app data directory".to_string())?;
    
    let thumb_dir = app_dir.join("thumbnails");
    std::fs::create_dir_all(&thumb_dir)
        .map_err(|e| format!("Create thumbnail dir failed: {}", e))?;
    
    let url_hash = blake3::hash(url.as_bytes()).to_hex().to_string();
    Ok(thumb_dir.join(format!("{}_thumb.jpg", &url_hash[..16])))
}

async fn analyze_media_file(path: &PathBuf, url: &str) -> Result<MediaPreviewJSON, String> {
    let media_type = detect_media_type(url);
    println!("[MEDIA_PREVIEW] Detected media type: {}", media_type);
    
    let mut preview = MediaPreviewJSON {
        url: url.to_string(),
        media_type: media_type.clone(),
        width: None,
        height: None,
        duration: None,
        file_size: None,
        thumbnail_path: None,
        metadata: MediaMetadata::default(),
    };
    
    // Try to get image dimensions for images
    if media_type == "image" {
        if let Ok(img) = image::open(path) {
            let (w, h) = img.dimensions();
            preview.width = Some(w);
            preview.height = Some(h);
            println!("[MEDIA_PREVIEW] Image dimensions: {}x{}", w, h);
        }
        
        // Try EXIF parsing using nom-exif (simplified)
        // For now we'll skip complex EXIF parsing to avoid API issues
        // TODO: Add proper EXIF parsing with correct nom-exif API
    }
    
    Ok(preview)
}

fn detect_media_type(url: &str) -> String {
    let lower = url.to_lowercase();
    if lower.ends_with(".jpg") || lower.ends_with(".jpeg") || 
       lower.ends_with(".png") || lower.ends_with(".gif") || 
       lower.ends_with(".webp") || lower.ends_with(".bmp") {
        "image".to_string()
    } else if lower.ends_with(".mp4") || lower.ends_with(".mov") || 
              lower.ends_with(".webm") || lower.ends_with(".avi") ||
              lower.ends_with(".mkv") {
        "video".to_string()
    } else if lower.ends_with(".mp3") || lower.ends_with(".m4a") || 
              lower.ends_with(".ogg") || lower.ends_with(".wav") ||
              lower.ends_with(".flac") {
        "audio".to_string()
    } else {
        "unknown".to_string()
    }
}

async fn create_thumbnail(app: &AppHandle, source_path: &PathBuf, url: &str) -> Result<String, String> {
    let thumb_path = get_thumbnail_cache_path(app, url)?;
    
    // Check if thumbnail already exists
    if thumb_path.exists() {
        println!("[MEDIA_PREVIEW] Thumbnail already exists: {:?}", thumb_path);
        return Ok(thumb_path.to_string_lossy().to_string());
    }
    
    println!("[MEDIA_PREVIEW] Creating thumbnail: {:?}", thumb_path);
    
    let img = image::open(source_path)
        .map_err(|e| format!("Failed to open image: {}", e))?;
    
    let thumbnail = img.resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, FilterType::Lanczos3);
    
    thumbnail.save(&thumb_path)
        .map_err(|e| format!("Failed to save thumbnail: {}", e))?;
    
    Ok(thumb_path.to_string_lossy().to_string())
}
