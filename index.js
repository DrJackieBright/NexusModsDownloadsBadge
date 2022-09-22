const express = require('express')
const fetch = require('node-fetch')

const nexusApiUrl = "https://staticstats.nexusmods.com/live_download_counts/mods/"

const app = express();

app.get('/', async (req, res) => {
  let game = req.query.game
  let mod = req.query.mod

  res.send({
    "schemaVersion": 1,
    "logoSvg": await (await fetch("https://images.nexusmods.com/favicons/ReskinOrange/favicon.svg")).text(),
    "label": "Downloads",
    "message": await getDownloadCount(game, mod),
    "color": "orange"
  })
});

async function getDownloadCount(game, mod) {
  if (!game) return "Game ID not specified"
  if (!mod) return "Mod ID not specified"
  try {
    let nexusCSV = await fetch(`${nexusApiUrl}/${game}.csv`)
    if (nexusCSV.status == 404) return `Game "${game}" not found"`

    let match = (await nexusCSV.text()).match(new RegExp(`\\D${mod},\\d+,\\d+,\\d+`))
    if (match == null) return `Mod "${mod}" not found`

    let line = match[0].split(",")
    let data = {
      id: line[0],
      totalDownloads: line[1],
      uniqueDownloads: line[2],
      views: line[3]
    }
    return data.totalDownloads
  } catch (err) {
    //console.log(req)
    console.error(err)
    return "Internal Error"
  }
}

app.listen(process.env.PORT || 3000, () => {
  console.log('server started')
});