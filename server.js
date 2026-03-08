const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const os = require("os")
const qrcode = require("qrcode-terminal")

const app = express()
const upload = multer({ dest: "tmp/" })

const IMAGE_PATH = path.join(__dirname, "latest.png")

app.use(express.static("public"))

app.post("/upload", upload.single("image"), (req, res) => {
  const tmpPath = req.file.path

  fs.copyFileSync(tmpPath, IMAGE_PATH)
  fs.unlinkSync(tmpPath)

  res.send("ok")
})

app.get("/image", (req, res) => {
  if (fs.existsSync(IMAGE_PATH)) {
    res.sendFile(IMAGE_PATH)
  } else {
    res.status(404).send("no image")
  }
})

app.get("/exists", (req, res) => {
  res.json({ exists: fs.existsSync(IMAGE_PATH) })
})

function getLocalIP() {
  const nets = os.networkInterfaces()

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address
      }
    }
  }
}

const PORT = 5000

app.listen(PORT, "0.0.0.0", () => {

  const ip = getLocalIP()
  const url = `http://${ip}:${PORT}`

  console.log("")
  console.log("Server running:")
  console.log(url)
  console.log("")

  console.log("Scan this QR with iPad:")
  console.log("")

  qrcode.generate(url, { small: true })
})