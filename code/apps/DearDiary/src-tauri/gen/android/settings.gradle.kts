include(":app")

// 1. Give the module a logical name
include(":o19_activities")

// 2. Point to the physical folder
// Note: project.rootDir is 'src-tauri/gen/android'
// We need to go UP enough levels to reach your monorepo root.
// Adjust the number of "../" based on your actual folder structure.
project(":o19_activities").projectDir = File(rootDir, "../../../../../../o19/packages/android-activities").normalize()

// Debug helper: Uncomment this to see where it is looking during build
// println("Activities path: " + project(":activities").projectDir.absolutePath)

apply("tauri.settings.gradle")

