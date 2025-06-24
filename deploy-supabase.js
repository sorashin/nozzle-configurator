import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadFiles() {
  const distPath = path.join(__dirname, 'dist')
  
  // dist/内のすべてのファイルを取得
  const files = getAllFiles(distPath)
  
  for (const file of files) {
    const relativePath = path.relative(distPath, file)
    const fileBuffer = fs.readFileSync(file)
    
    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('website')
      .upload(relativePath, fileBuffer, {
        contentType: getContentType(file),
        upsert: true
      })
    
    if (error) {
      console.error(`Error uploading ${relativePath}:`, error)
    } else {
      console.log(`Uploaded: ${relativePath}`)
    }
  }
}

function getAllFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  
  return files
}

function getContentType(file) {
  const ext = path.extname(file).toLowerCase()
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
  }
  return contentTypes[ext] || 'application/octet-stream'
}

uploadFiles().catch(console.error)