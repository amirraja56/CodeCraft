'use client'

import { useState, useEffect, useRef } from 'react'
import Split from 'react-split'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayIcon, DownloadIcon, SettingsIcon, CopyIcon, CheckIcon, FileIcon, SaveIcon, ZoomInIcon, ZoomOutIcon, TrashIcon } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeCraft Project</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Welcome to CodeCraft</h1>
  <p>Start coding your project here!</p>
  <script src="script.js"></script>
</body>
</html>`

const defaultCSS = `body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
}`

const defaultJS = `document.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');
  // Your JavaScript code here
});`

export default function Component() {
  const [output, setOutput] = useState('')
  const [code, setCode] = useState({ html: defaultHTML, css: defaultCSS, js: defaultJS })
  const [activeTab, setActiveTab] = useState('html')
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [outputFontSize, setOutputFontSize] = useState(14)
  const [savedFiles, setSavedFiles] = useState<string[]>([])
  const [displayMode, setDisplayMode] = useState('code')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const savedFilesFromStorage = localStorage.getItem('savedFiles')
    if (savedFilesFromStorage) {
      setSavedFiles(JSON.parse(savedFilesFromStorage))
    }
  }, [])

  useEffect(() => {
    runCode()
  }, [outputFontSize])

  const runCode = () => {
    const combinedCode = `
      <html>
        <head>
          <style>
            ${code.css}
            body { font-size: ${outputFontSize}px; }
          </style>
        </head>
        <body>
          ${code.html}
          <script>${code.js}</script>
        </body>
      </html>
    `
    setOutput(combinedCode)

    if (iframeRef.current) {
      const iframeDocument = iframeRef.current.contentDocument
      if (iframeDocument) {
        iframeDocument.body.style.fontSize = `${outputFontSize}px`
      }
    }
  }

  const handleCodeChange = (language: string, value: string) => {
    setCode(prevCode => ({ ...prevCode, [language]: value }))
  }

  const copyCode = () => {
    const currentCode = code[activeTab as keyof typeof code]
    navigator.clipboard.writeText(currentCode).then(() => {
      setCopied(true)
      toast({
        title: "Code copied!",
        description: "The code has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const resetAllCode = () => {
    if (code.html !== defaultHTML || code.css !== defaultCSS || code.js !== defaultJS) {
      const confirmReset = window.confirm("Are you sure you want to reset all code (HTML, CSS, and JavaScript) to the default? This action cannot be undone.")
      if (!confirmReset) return
    }
    setCode({ html: defaultHTML, css: defaultCSS, js: defaultJS })
    setActiveTab('html')
    toast({
      title: "All code reset to default",
      description: "HTML, CSS, and JavaScript have been reset to their default states.",
    })
  }

  const saveFile = () => {
    const fileName = prompt("Enter a name for your file:")
    if (fileName) {
      const fileContent = JSON.stringify(code)
      localStorage.setItem(`file_${fileName}`, fileContent)
      setSavedFiles(prev => [...prev, fileName])
      localStorage.setItem('savedFiles', JSON.stringify([...savedFiles, fileName]))
      toast({
        title: "File saved",
        description: `Your file "${fileName}" has been saved.`,
      })
    }
  }

  const loadFile = (fileName: string) => {
    const fileContent = localStorage.getItem(`file_${fileName}`)
    if (fileContent) {
      setCode(JSON.parse(fileContent))
      toast({
        title: "File loaded",
        description: `Your file "${fileName}" has been loaded.`,
      })
    }
  }

  const deleteFile = (fileName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)
    if (confirmDelete) {
      localStorage.removeItem(`file_${fileName}`)
      setSavedFiles(prev => prev.filter(file => file !== fileName))
      localStorage.setItem('savedFiles', JSON.stringify(savedFiles.filter(file => file !== fileName)))
      toast({
        title: "File deleted",
        description: `Your file "${fileName}" has been deleted.`,
      })
    }
  }

  const downloadCode = () => {
    const blob = new Blob([JSON.stringify(code, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'code.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const increaseFontSize = () => {
    if (displayMode === 'code') {
      setFontSize(prevSize => Math.min(prevSize + 2, 24))
    } else {
      setOutputFontSize(prevSize => Math.min(prevSize + 2, 24))
    }
  }

  const decreaseFontSize = () => {
    if (displayMode === 'code') {
      setFontSize(prevSize => Math.max(prevSize - 2, 10))
    } else {
      setOutputFontSize(prevSize => Math.max(prevSize - 2, 10))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-400">CodeCraft</h1>
        <div className="flex space-x-2 items-center">
          <Select value={displayMode} onValueChange={setDisplayMode}>
            <SelectTrigger className="w-[180px] bg-purple-600 hover:bg-purple-700 text-white">
              <SelectValue placeholder="Select display" />
            </SelectTrigger>
            <SelectContent className='bg-purple-600'>
              <SelectItem value="code">Code Display</SelectItem>
              <SelectItem value="output">Output Display</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={increaseFontSize}>
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={decreaseFontSize}>
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={downloadCode}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-purple-600 hover:bg-purple-700 text-white">
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <Split
        className="flex-grow flex"
        sizes={[50, 50]}
        minSize={100}
        expandToMin={false}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
      >
        <div className="flex flex-col">
          <Tabs defaultValue="html" className="w-full" onValueChange={(value) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="html" className="data-[state=active]:bg-blue-600">HTML</TabsTrigger>
              <TabsTrigger value="css" className="data-[state=active]:bg-green-600">CSS</TabsTrigger>
              <TabsTrigger value="js" className="data-[state=active]:bg-yellow-600">JavaScript</TabsTrigger>
            </TabsList>
            <TabsContent value="html">
              <Textarea 
                className="min-h-[300px] bg-gray-800 text-gray-100" 
                placeholder="Enter HTML code here..."
                value={code.html}
                onChange={(e) => handleCodeChange('html', e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: `${fontSize}px` }}
              />
            </TabsContent>
            <TabsContent value="css">
              <Textarea 
                className="min-h-[300px] bg-gray-800 text-gray-100" 
                placeholder="Enter CSS code here..."
                value={code.css}
                onChange={(e) => handleCodeChange('css', e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: `${fontSize}px` }}
              />
            </TabsContent>
            <TabsContent value="js">
              <Textarea 
                className="min-h-[300px] bg-gray-800 text-gray-100" 
                placeholder="Enter JavaScript code here..."
                value={code.js}
                onChange={(e) => handleCodeChange('js', e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: `${fontSize}px` }}
              />
            </TabsContent>
          </Tabs>
          <div className="flex justify-between mt-2">
            <Button onClick={resetAllCode} className="bg-red-600 hover:bg-red-700">
              <FileIcon className="h-4 w-4 mr-2" />
              Reset All
            </Button>
            <Button onClick={saveFile} className="bg-blue-600 hover:bg-blue-700">
              <SaveIcon className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-green-400">Output</h2>
            <div className="flex space-x-2">
              <Button onClick={copyCode} className="bg-blue-600 hover:bg-blue-700">
                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button onClick={runCode} className="bg-green-600 hover:bg-green-700">
                <PlayIcon className="h-4 w-4 mr-2" />
                Run
              </Button>
            </div>
          </div>
          <iframe
            ref={iframeRef}
            className="flex-grow bg-white rounded"
            srcDoc={output}
            title="Output"
            sandbox="allow-scripts"
            width="100%"
            style={{ minHeight: '300px' }}
          />
        </div>
      </Split>
      <footer className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Saved Files</h3>
        <div className="flex flex-wrap gap-2">
          {savedFiles.map((fileName) => (
            <div key={fileName} className="flex items-center bg-gray-800 rounded-md overflow-hidden">
              <Button variant="ghost" className="px-3 py-1 text-sm" onClick={() => loadFile(fileName)}>
                {fileName}
              </Button>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => deleteFile(fileName)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}