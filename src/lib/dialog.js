const { app, dialog, ipcMain, BrowserWindow } = require('electron');

const { fs, readdirSync, renameSync } = require('fs');
const { join } = require('path');
const Regex = require('regex');
const { readFile } = require('fs/promises');
const { detect } = require('chardet');
const { decode } = require('iconv-lite');
const {logFileTypeMatches} = require('./match.js');
const win = BrowserWindow.getAllWindows()[0];
const { Open } = require('unzipper');
// import { pcmaticScanLog } from './match.js';/


var options = {
   forward: true,
   findNext: true,
   matchCase: false,
   wordStart: false,
   medialCapitalAsWordStart: false
}

async function sendData(){
   const win = BrowserWindow.getAllWindows()[0];
   const data = await fileGetter()
   console.log(data)
   win.webContents.send('data',data);
}


 ipcMain.on('search', (e, args)=>{
   
   const win = BrowserWindow.getAllWindows()[0];
   win.webContents.findInPage( args, options);
   win.webContents.on('found-in-page', (event, result) => {
      if (result.finalUpdate) {
        win.webContents.stopFindInPage('keepSelection');
      }
   });
 
})

async function unzip(){
   var settings = {
      title:'select zip file',
      filters: [
         {name:'Zip File', extensions:['zip']}
      ],
      properties:['openFile']
   }
   try {
         const file = await dialog.showOpenDialog(settings);
         if(typeof file.filePaths !== 'undefined' && file.canceled !== true){
            //console.log('file selected')
            await Open.file(file.filePaths.toString())
               .then(d => d.extract({path:app.getPath("downloads")}));
            // const timeDone = new Date()
            const files = readdirSync(app.getPath("downloads"));
            const rematch = /(pcpitstop_logs)/i;

            let log = files.filter(file => file.match(rematch))
            log = log[0];
            //console.log("log---->: "+log)
            let datenow = new Date();
            let filePath = join(app.getPath("downloads"), log.toString());
            let newFilePath = join(app.getPath("downloads"), log.toString()+"_"+ datenow.getMonth()+1 +"_"+ datenow.getDay()+"_"+ datenow.getHours()+"_"+ datenow.getMinutes());
           // console.log('old path --->'+filePath)
           // console.log('new path --->'+newFilePath)
       
            renameSync(filePath, newFilePath, (err)=>{
               if(err) {
                  throw new err;
               }
               //console.log("directory renamed")
            });

               //console.log(log)
               // .forEach(file =>{
                 
               // })
            
         }
   } catch (error) {
    console.log(error)
   }

}


ipcMain.on('unzip', async (e,args)=>{
  await unzip();
  const win = BrowserWindow.getAllWindows()[0];
  win.webContents.send('fileUnzipped','done')
})


 ipcMain.on('clear', (e, args)=>{
  
   const win = BrowserWindow.getAllWindows()[0];
   win.webContents.stopFindInPage('clearSelection');
})

 ipcMain.on('reset', (e, args)=>{
   sendData()
})


async function fileGetter () {
 
      try {
         // dialog = remote.dialog;
        
         const options = {
            browserWindow: true,
            defaultPath: app.getPath("downloads"),
            title: "Log parser",
            buttonLabel: "select file to analyze",
            filters: [
              { name:".txt or .log files", extensions:["txt","log"]},
              { name:"All files", extensions:['*']}
            ],
            properties:['openFile']
         };
       
      
         let filePathResults = await dialog.showOpenDialog( options);
         // ipcRenderer.send('ready', 'logfileselected')
         
        
         
         if(typeof filePathResults.filePaths !== 'undefined' && filePathResults.canceled !== true) {
            const logDirectory = filePathResults.filePaths[0] 
            // var path = logDirectory.toString()
            // console.log(path,"tostring method")
            path = logDirectory.split(/\\/g)
            var pathToDirectory = path.slice(0,-1).join("\\")
            console.log(pathToDirectory +"\\","dialog.js")
            module.exports.pathToDirectory = pathToDirectory+"\\" 
            // console.log(filePathResults.filePaths[0],"------------..............-.-")
            const browserWindow = BrowserWindow.getAllWindows()[0];
            browserWindow.webContents.send('ready','logfileSelected')
            return parseLog(logDirectory)
            
            // for(let i = 0; i < filePathResults.filePaths.length; i++){
            //    let filepath = filePathResults.filePaths[i]
             
            //    return parseLog(filepath)
            //    }
            }
         else
            { 
               return;
            }

      } catch (error) {
         console.error(error)
      }
      
}

function getFileTypeMatches(fileName) {
  
   var fileNameMatches = {
      ScheduleScanLog: /.+scan\[pcmatic\].+\.log/ig,
      ss:/.+pcmatic_rt.+\.log/ig,
      checkScheduler:/.+(checkschedule\[pcmatic\]).*log/ig,
      systemInfo: /.+sysinfo.log/ig,
      pcmaticScanLog:/.+(pcmatic-\d{8})\.log/ig,
      unknown:/.+/ig
   }

   for (var match in fileNameMatches) { //match is just the index value
      
      if (fileName.match(fileNameMatches[match]))return match
   }
 
}

function outputMatches(matches) {
    const lineBreak = '\r\n<br><br>';
   return matches.map( (line) => {return "<div class='line'>"+ line  +"</div>" + lineBreak} ).join("")
}
function outputLine(matches) {
    const lineBreak = '\r\n<br><br>';
   return matches.map( (line) => {return "<div class='pup'>"+ line  +"</div>" + lineBreak } ).join("")
}
function outputNotPresent(matches) {
    const lineBreak = '\r\n<br>';
   return matches.map( (line) => {return  line } ).join("")
}

// function jsonConverter(matches){
//    const lineBreak = '\r\n<br>';
//    return matches.map(line => {return "<p class='json'>"+ JSON.stringify(line)+"</p>"} )
// }

var benchmarkItems = {};
// function to determine how long an action takes
function benchmark(name, action) {
   if (action=='start') {
      benchmarkItems[name] = new Date();
   } else {
      var now = new Date();
      console.log('benchmarking...')
      console.log(now.getTime())
      console.log(benchmarkItems[name].getTime())
      var totalTime = now.getTime() - benchmarkItems[name].getTime();
      console.log('totalTime: ' + totalTime)
      return Number(totalTime).toFixed(0);
   }
}

// analyze logfile and parse data
async function parseLog(file){
  //console.log(file)
  var indicators = [];
  var notFoundItems = [];
  const nameOfFile=/\b[\w-\[]*[-|[\d*\]]*\.log$/im 
  const nameToDisplay = file.match(nameOfFile);
  const nameAllCaps = nameToDisplay.map((letter) => {return letter.toUpperCase()})
  indicators.push(`<h4 class="mb-4">${nameAllCaps?nameAllCaps:""}</h4>`)
   //benchmark('getFileTypeMatches', 'start');
   var fileTypeMatch = getFileTypeMatches(file);// working as expected returns key
   console.log(`----%%^^^^^filetype Match ${fileTypeMatch} `)
   if(fileTypeMatch === "unknown") {
      indicators.push("<h2>The logParser is not set to read "+ nameToDisplay+ " at this time</h2><button id='logfile' class='btn btn-outline-primary'>Choose Another Logfile</button>")
      const window = BrowserWindow.getAllWindows()[0];
      window.webContents.send('done','processedLog')
      return indicators;
   }

   var logMatches = logFileTypeMatches[fileTypeMatch]; //access the correct key in match finder 
   // console.log(logMatches)

   try {
      //grab file
      const bufferData = await readFile(file);
      //loads file into memory
      var buff = Buffer.from(bufferData);
      //detects document enconding
      var encoding = detect(buff);
      //changes enconding if not utf8
      var actualString = decode(buff, encoding).toString('utf8');
      
      var lines = actualString.split('\r\n');
      var lastTwoLines =lines[lines.length-3] + lines[lines.length-2] + lines[lines.length-1];
      var isPCMAticLog = fileTypeMatch === "pcmaticScanLog"?true:false;
      if(isPCMAticLog){
         let lastLineElement = '<h3 class="title text-center">Last Two lines of Log</h3>' ;
         lastLineElement += "<p class='pup'>"+lastTwoLines+"</p>" ;
         indicators.push(lastLineElement);
      }
      
      //console.log(`last two----^&*() ${lastTwoLines}`)
      for (var i=0; i < logMatches.length; i++) {

         // console.log(`beginning in orginal array looooop---->${logMatches[i]['regex']}`)
         if(Array.isArray(logMatches[i].regex)) {
            var isMatch = false;
            var htmlElement =  '<h3 class="title text-center">' + logMatches[i]['description'] + '</h3>'
         
            for(var j=0; j< logMatches[i].regex.length; j++){

               
               // console.log(`inside secondary loop ${logMatches[i].regex[j]['regex']}`)
               if(matches = actualString.match(logMatches[i].regex[j]['regex']) ){
                  isMatch = true;
         
                  htmlElement += "<div>";
                  htmlElement += "<p class='infoHeader'>"+logMatches[i].regex[j]['info']+"</p>";
                  if(isPCMAticLog){
               
                     matches.map((line, index)=>
                     {if(index ===0 && logMatches[i].regex[j]['info'] =="Scan Error"){
                        return htmlElement += `<p class="pup"> ${matches[0].toString().replace(/\n/g,"<br><br>")}<p>`
                     }else{
                        return htmlElement += `<p class="pup"> ${outputLine(matches)}<p>`
                     }})
                     
                  }else{
                     htmlElement += `<p class="pup"> ${outputLine(matches)}<p>`;
                  }
              
                  htmlElement +="</div>";
               }
                  
            }
            
            if(!isMatch){
               htmlElement = '<h5 class="not-found  bg-success">No ' + logMatches[i]['description'] + ' found in current log </h5>';
               notFoundItems.push(htmlElement)
               
            }else{
               isMatch = false;
               indicators.push(htmlElement);
            }      
         
         } else if (typeof(logMatches[i]['regex']) == 'object') {

            if(matches = actualString.match(logMatches[i]['regex'])) {
e

               // console.log(`in last array looooop----> ${logMatches[i].regex}`)
               var htmlElement = '<div class=" log">';
               htmlElement += '<h3 class="title text-center">' + logMatches[i]['description'] + '</h3>';
               htmlElement += '<p class="info ">'+ outputMatches(matches)  +'</p>';
               htmlElement += '</div>';
               indicators.push(htmlElement) 
            }else{
               var htmlElement = '<h5 class="not-found bg-success">No ' + logMatches[i]['description'] + ' found in current Log</h5>';
               notFoundItems.push(htmlElement)
            }
         } else if (typeof(logMatches[i]['regex']) == "function"){
            var _results = logMatches[i]['regex']()
            var elements = []
            for(let i=0; i < _results.length ; i++){
               var htmlElement = '<div class=" log">';
               htmlElement += '<h3 class="title text-center">' + logMatches[i]['description'] + '</h3>';
               htmlElement += '<p class="info ">'+ outputMatches(matches)  +'</p>';
               htmlElement += '</div>';
               indicators.push(htmlElement) 

            }
            indicators.push(elements)
         }
      }
      //console.log(`Before push to renderer process---->`)
      const window = BrowserWindow.getAllWindows()[0];
      window.webContents.send('done','processedLog')
      let notFoundItemsArray = "<div class='notFoundDiv'>"+ outputNotPresent(notFoundItems) +"</div>";
      indicators.unshift(notFoundItemsArray);
      return indicators ;
   } catch (error) {
      console.error(error)
   }
  
}

// const _fileGetter = fileGetter;
module.exports.fileGetter = fileGetter ;

