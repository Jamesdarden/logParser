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



var options = {
   forward: true,
   findNext: true,
   matchCase: false,
   wordStart: false,
   medialCapitalAsWordStart: false
}

//selects file and parses the selected file if logic available
async function sendData(){
   const win = BrowserWindow.getAllWindows()[0];
   const data = await fileGetter()
   console.log(data)
   win.webContents.send('data',data);
}

// search feature
 ipcMain.on('search', (e, args)=>{
   
   const win = BrowserWindow.getAllWindows()[0];
   win.webContents.findInPage( args, options);
   win.webContents.on('found-in-page', (event, result) => {
      if (result.finalUpdate) {
        win.webContents.stopFindInPage('keepSelection');
      }
   });
 
})

//unzip selected zip file and renames it
async function unzip(){
   var settings = {
      title:'select zip file',
      filters: [
         {name:'Zip File', extensions:['zip']}
      ],
      properties:['openFile']
   }
   try {
         //shows file menu to select desired file.
         const file = await dialog.showOpenDialog(settings);
         if(typeof file.filePaths !== 'undefined' && file.canceled !== true){
            //console.log('file selected')
            await Open.file(file.filePaths.toString())
               .then(d => d.extract({path:app.getPath("downloads")}));
            // const timeDone = new Date()
            const files = readdirSync(app.getPath("downloads"));
            const rematch = /(pcpitstop_logs)/i;

            //filters zip make sure its a PC Matic log
            let log = files.filter(file => file.match(rematch))
            log = log[0];
            let datenow = new Date();
            let filePath = join(app.getPath("downloads"), log.toString());
            let newFilePath = join(app.getPath("downloads"), log.toString()+"_"+ datenow.getMonth()+1 +"_"+ datenow.getDay()+"_"+ datenow.getHours()+"_"+ datenow.getMinutes());
       
            renameSync(filePath, newFilePath, (err)=>{
               if(err) {
                  throw new err;
               }
            });
         }
   } catch (error) {
    console.log(error)
   }

}

//unzips on unzip event
ipcMain.on('unzip', async (e,args)=>{
  await unzip();
  const win = BrowserWindow.getAllWindows()[0];
  win.webContents.send('fileUnzipped','done')
})

// stops searching
 ipcMain.on('clear', (e, args)=>{
  
   const win = BrowserWindow.getAllWindows()[0];
   win.webContents.stopFindInPage('clearSelection');
})

 ipcMain.on('reset', (e, args)=>{
   sendData()
})


// function that gets file and parses log and sends data to renderer process
async function fileGetter () {
      try {
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
       
         // gets file once selected.
         let filePathResults = await dialog.showOpenDialog( options);
         
         if(typeof filePathResults.filePaths !== 'undefined' && filePathResults.canceled !== true) {
            const logDirectory = filePathResults.filePaths[0] 
            path = logDirectory.split(/\\/g)
            var pathToDirectory = path.slice(0,-1).join("\\")
            // exports folder location to be used in ss function in match.js
            module.exports.pathToDirectory = pathToDirectory+"\\" 
         
            const browserWindow = BrowserWindow.getAllWindows()[0];
            // lets renderer know logfile has been selected.
            browserWindow.webContents.send('ready','logfileSelected')
            return parseLog(logDirectory)
            }
         else
            { 
               return;
            }

      } catch (error) {
         console.error(error)
      }
      
}

// checks selected filename and matches to object with apporiate regex if available 
// if unknown lets the user know
function getFileTypeMatches(fileName) {
  
   var fileNameMatches = {
      ScheduleScanLog: /.+scan\[pcmatic\].+\.log/ig,
      ss:/.+pcmatic_rt.+\.log/ig,
      checkScheduler:/.+(checkschedule\[pcmatic\]).*log/ig,
      systemInfo: /.+sysinfo.log/ig,
      pcmaticScanLog:/.+(pcmatic-\d{8})\.log/ig,
      rtService:/.+PCMaticRTService-\d{8}\.log/gi,
      unknown:/.+/ig
   }

   for (var match in fileNameMatches) { //match is just the index value
      // returns match of  filename matches which is a key in match.js
      if (fileName.match(fileNameMatches[match]))return match
   }
 
}

// splits matches and input </br> between new lines
function outputMatches(matches) {
    const lineBreak = '\r\n<br><br>';
    if(Array.isArray(matches)){ 
         return matches.map( (line) => {return "<div class='line'>"+ line  +"</div>" + lineBreak} ).join("")
      }else{ 
         return matches} 
}

//inputs line breaks
function splitLines(matches){
   seperatedLines =[]
   // if matches array greater than 1 split array item individually
   if(matches.length > 1 ){
     for(let i= 0; i < matches.length; i++){
        let split = matches[i].split("\r\n")
        let newArrayItem = split.map(x => x+"</br>").join("")
        seperatedLines.push(`<div class="pup">${newArrayItem}</div></br>`)
     } 
     return seperatedLines
   }
   // if matches not greater than 1 line up and return
   var lines = matches.toString().split("\r\n")
   return lines.map(x => x+"</br>").join("")

}

// splits and seprates array items
function outputLine(matches) {
    const lineBreak = '\r\n<br><br>';
   return matches.map( (line) => {return "<div class='pup'>"+ line  +"</div>" + lineBreak } ).join("")
}

// if matches not present
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
   var fileTypeMatch = getFileTypeMatches(file);// matches log name with key

   // if no logic for selected file
   if(fileTypeMatch === "unknown") {
      indicators.push("<h2>The logParser is not set to read "+ nameToDisplay+ " at this time</h2><button id='logfile' class='btn btn-outline-primary'>Choose Another Logfile</button>")
      const window = BrowserWindow.getAllWindows()[0];
      window.webContents.send('done','processedLog')
      return indicators;
   }

   var logMatches = logFileTypeMatches[fileTypeMatch]; //access the correct key in match finder 
 

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
      //if pcmatic log adds last two lines of the scan
      if(isPCMAticLog){
         let lastLineElement = '<h3 class="title text-center">Last Two lines of Log</h3>' ;
         lastLineElement += "<p class='pup'>"+lastTwoLines+"</p>" ;
         indicators.push(lastLineElement);
      }
      
      // loops through regex which is an regex object or an array of regex obj
      for (var i=0; i < logMatches.length; i++) {
         // if array loops through array
         if(Array.isArray(logMatches[i].regex)) {
            // tracks if match is found
            var isMatch = false;
            var htmlElement =  '<h3 class="title text-center">' + logMatches[i]['description'] + '</h3>'
            for(var j=0; j< logMatches[i].regex.length; j++){
               // if matches format and return
               if(matches = actualString.match(logMatches[i].regex[j]['regex']) ){
                  isMatch = true;
                  htmlElement += "<div>";
                  htmlElement += "<p class='infoHeader'>"+logMatches[i].regex[j]['info']+"</p>";
                  if(isPCMAticLog){
                     //if first regex break up match for readability
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
            //if no matches found display this
            if(!isMatch){
               htmlElement = '<h5 class="not-found  bg-success">No ' + logMatches[i]['description'] + ' found in current log </h5>';
               notFoundItems.push(htmlElement)
               
            }else{
               //intializes match to false
               isMatch = false;
               indicators.push(htmlElement);
            }      
          //checks if regex key is a regex object
         } else if (typeof(logMatches[i]['regex']) == 'object') {
            //check if selected file is rt service log
            if( fileTypeMatch == 'rtService'){
               //if first obj in array
               if(i == 0){
                  //if matches grab the last one and display
                  if(matches = actualString.match(logMatches[i]['regex'])){
                     var htmlElement = '<div class=" log">';
                     htmlElement += '<h3 class="title text-center">' + logMatches[i]['description'] + '</h3>';
                     htmlElement += '<p class="info ">'+ splitLines(matches.slice(-1))  +'</p>';
                     htmlElement += '</div>';
                     indicators.push(htmlElement) 
                  }
               }else{
                  // not first obj in rtservice obj array
                  // checks for matches
                  if(matches = actualString.match(logMatches[i]['regex'])){
                     var htmlElement = '<div class=" log">';
                     htmlElement += '<h3 class="title text-center">' + logMatches[i]['description'] + '</h3>';
                     htmlElement += '<p class="info ">'+ splitLines(matches).join("")  +'</p>';
                     htmlElement += '</div>';
                     indicators.push(htmlElement) 
                  }else{
                     // if no matches change desc key text to reflect no matches
                     logMatches[i]['description'] = "SS has not reported being off in current Log "
                     var htmlElement = '<div class=" log">';
                     htmlElement += '<h3 class="not-found  bg-success">' + logMatches[i]['description'] + '</h3>';
                     htmlElement += '</div>';
                     // push to beginning of indications array
                     indicators.unshift(htmlElement) 
                  }
               }

               // if logfile not rt service log
            }else{
               if(matches = actualString.match(logMatches[i]['regex'])) {
                  var htmlElement = '<div class=" log">';
                  htmlElement += '<h3 class="title text-center">' + logMatches[i]['description'] + '</h3>';
                  htmlElement += '<p class="info ">'+ outputMatches(matches)  +'</p>';
                  htmlElement += '</div>';
                  indicators.push(htmlElement) 
               }else{
                  // if no matches found
                  var htmlElement = '<h5 class="not-found bg-success">No ' + logMatches[i]['description'] + ' found in current Log</h5>';
                  notFoundItems.push(htmlElement)
               }
            }  // if regex key equals a function
         } else if (typeof(logMatches[i]['regex']) == "function"){
            // await results from function which return description: and matches: keys
            var _results = await logMatches[i]['regex']()
            var elements = []
            for(let i=0; i < _results.length ; i++){
               var htmlElement = '<div class=" log">';
               htmlElement += '<h3 class="title text-center">' + _results[i]['description'] + '</h3>';
               htmlElement += '<p class="info ">'+ outputMatches(_results[i]['matches']) +'</p>';
               htmlElement += '</div>';
               elements.push(htmlElement) 

            }
            indicators.push(elements)
         }
      }
      const window = BrowserWindow.getAllWindows()[0];
      // send finshed event
      window.webContents.send('done','processedLog')
      let notFoundItemsArray = "<div class='notFoundDiv'>"+ outputNotPresent(notFoundItems) +"</div>";
      // pushes not found item to beginning of the array
      indicators.unshift(notFoundItemsArray);
      return indicators ;
   } catch (error) {
      console.error(error)
   }
  
}

// const _fileGetter = fileGetter;
module.exports.fileGetter = fileGetter ;

