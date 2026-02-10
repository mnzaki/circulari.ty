CREATE TABLE `people` (
	`did` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`avatar_uri` text,
	`bio` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `previews` (
	`url` text PRIMARY KEY NOT NULL,
	`preview_type` text DEFAULT 'html' NOT NULL,
	`title` text,
	`description` text,
	`image_url` text,
	`images` text,
	`site_name` text,
	`media_type` text,
	`width` integer,
	`height` integer,
	`duration` integer,
	`file_size` integer,
	`thumbnail_path` text,
	`media_url` text,
	`fetched_at` integer NOT NULL,
	`error` text
);
