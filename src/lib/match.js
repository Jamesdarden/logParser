const regex = require("regex")
const  {readFile}= require('fs/promises')
const { detect } = require('chardet');
const { decode } = require('iconv-lite');

const pup = [
  {
      regex: /.+\s1ClickDownload\s.+/gi,
      info: '1ClickDownload was found in line'
    },
    {
      regex: /.+\sMyPcBackup\s.+/gi,
      info: 'MyPcBackup was found in line'
    },
    {
      regex: /.+\ssystem mechanic\s.+/gi,
      info: 'system mechanic was found in line'
    },
    {
      regex: /.+\sMyCleanPC\s.+/gi,
      info: 'MyCleanPC  was found in line'
    },
    {
      regex: /.+\sPC Optimizer Pro\s.+/gi,
      info: 'PC Optimizer Pro  was found in line'
    },
    {
      regex: /.+\s?torrent\s?.+/gi,
      info: 'Possible torrent app installed'
    },
    { regex: /.+\s215Apps\s.+/gi, info: '215Apps was found in line' },  
    {
      regex: /.+\sMySearchDial\s.+/gi,
      info: 'MySearchDial was found in line'
    },
    { regex: /.+\s22Find\s.+/gi, info: '22Find was found in line' },    
    {
      regex: /.+\sMyWebSearch\s.+/gi,
      info: 'MyWebSearch was found in line'
    },
    { regex: /.+\sAartemis\s.+/gi, info: 'Aartemis was found in line' },
    {
      regex: /.+\sNationZoom\s.+/gi,
      info: 'NationZoom was found in line'
    },
    {
      regex: /.+\sAd.yieldmanager\s.+/gi,
      info: 'Ad.yieldmanager was found in line'
    },
    {
      regex: /.+\sNattly Search\s.+/gi,
      info: 'Nattly Search was found in line'
    },
    { regex: /.+\sAdlyrics\s.+/gi, info: 'Adlyrics was found in line' },
    {
      regex: /.+\sNetwork System Driver\s.+/gi,
      info: 'Network System Driver was found in line'
    },
    {
      regex: /.+\sAwesomehp.com\s.+/gi,
      info: 'Awesomehp.com was found in line'
    },
    {
      regex: /.+\sNew Player\s.+/gi,
      info: 'New Player was found in line'
    },
    { regex: /.+\sBablyon\s.+/gi, info: 'Bablyon was found in line' },
    { regex: /.+\sOminent\s.+/gi, info: 'Ominent was found in line' },
    {
      regex: /.+\sBandoo Media\s.+/gi,
      info: 'Bandoo Media was found in line'
    },
    { regex: /.+\sOpenCandy\s.+/gi, info: 'OpenCandy was found in line' },
    { regex: /.+\sBit89\s.+/gi, info: 'Bit89 was found in line' },
    { regex: /.+\sOtShot\s.+/gi, info: 'OtShot was found in line' },
    { regex: /.+\sBoxore\s.+/gi, info: 'Boxore was found in line' },
    { regex: /.+\sOutfox TV\s.+/gi, info: 'Outfox TV was found in line' },
    {
      regex: /.+\sBrowsers_Apps_Pro\s.+/gi,
      info: 'Browsers_Apps_Pro was found in line'
    },
    { regex: /.+\sOutobox\s.+/gi, info: 'Outobox was found in line' },
    {
      regex: /.+\sBubbleDock\s.+/gi,
      info: 'BubbleDock was found in line'
    },
    {
      regex: /.+\sPC Powerspeed\s.+/gi,
      info: 'PC Powerspeed was found in line'
    },
    {
      regex: /.+\sBuenoSearch\s.+/gi,
      info: 'BuenoSearch was found in line'
    },
    { regex: /.+\sPCSpeedUp\s.+/gi, info: 'PCSpeedUp was found in line' },
    {
      regex: /.+\sBuzzSearch\s.+/gi,
      info: 'BuzzSearch was found in line'
    },
    {
      regex: /.+\sPerion Network Ltd.\s.+/gi,
      info: 'Perion Network Ltd. was found in line'
    },
    { regex: /.+\sCartwheel\s.+/gi, info: 'Cartwheel was found in line' },
    {
      regex: /.+\sPic Enhance\s.+/gi,
      info: 'Pic Enhance was found in line'
    },
    { regex: /.+\sCheckMeUp\s.+/gi, info: 'CheckMeUp was found in line' },
    {
      regex: /.+\sPrice Minus\s.+/gi,
      info: 'Price Minus was found in line'
    },
    {
      regex: /.+\sCinema Plus\s.+/gi,
      info: 'Cinema Plus was found in line'
    },
    {
      regex: /.+\sPriceLEess\s.+/gi,
      info: 'PriceLEess was found in line'
    },
    {
      regex: /.+\sClaro   Quone8\s.+/gi,
      info: 'Claro \tQuone8 was found in line'
    },
    {
      regex: /.+\sCloudScout Parental Control\s.+/gi,
      info: 'CloudScout Parental Control was found in line'
    },
    { regex: /.+\sQvo6\s.+/gi, info: 'Qvo6 was found in line' },
    { regex: /.+\sConduit\s.+/gi, info: 'Conduit was found in line' },
    {
      regex: /.+\sResoft Ltd.\s.+/gi,
      info: 'Resoft Ltd. was found in line'
    },
    {
      regex: /.+\sCoupon Printer for Win\s.+/gi,
      info: 'Coupon Printer for Win was found in line'
    },
    {
      regex: /.+\sRocketfuel Installer\s.+/gi,
      info: 'Rocketfuel Installer was found in line'
    },
    {
      regex: /.+\sCouponDropDown  Safe Search\s.+/gi,
      info: 'CouponDropDown \tSafe Search was found in line'
    },
    {
      regex: /.+\sCrossrider\s.+/gi,
      info: 'Crossrider was found in line'
    },
    { regex: /.+\sSalesPlus\s.+/gi, info: 'SalesPlus was found in line' },
    { regex: /.+\sDealcabby\s.+/gi, info: 'Dealcabby was found in line' },
    { regex: /.+\sSalus\s.+/gi, info: 'Salus was found in line' },
    { regex: /.+\sDealio\s.+/gi, info: 'Dealio was found in line' },
    {
      regex: /.+\sSave Daily Deals\s.+/gi,
      info: 'Save Daily Deals was found in line'
    },
    {
      regex: /.+\sDefaulttab\s.+/gi,
      info: 'Defaulttab was found in line'
    },
    { regex: /.+\sSavefier\s.+/gi, info: 'Savefier was found in line' },
    {
      regex: /.+\sDelta_Homes\s.+/gi,
      info: 'Delta_Homes was found in line'
    },
    { regex: /.+\sSavepass\s.+/gi, info: 'Savepass was found in line' },
    {
      regex: /.+\sDesktop Temperature Monitor\s.+/gi,
      info: 'Desktop Temperature Monitor was found in line'
    },
    {
      regex: /.+\sSavepath Deals\s.+/gi,
      info: 'Savepath Deals was found in line'
    },
    {
      regex: /.+\sDns Unlocker\s.+/gi,
      info: 'Dns Unlocker was found in line'
    },
    {
      regex: /.+\sScorpinSaver\s.+/gi,
      info: 'ScorpinSaver was found in line'
    },
    { regex: /.+\sEazel\s.+/gi, info: 'Eazel was found in line' },
    {
      regex: /.+\sSearch.Certified\s.+/gi,
      info: 'Search.Certified was found in line'
    },
    { regex: /.+\sEn.V9\s.+/gi, info: 'En.V9 was found in line' },
    {
      regex: /.+\sSearch.ueep\s.+/gi,
      info: 'Search.ueep was found in line'
    },
    { regex: /.+\sFacemoods\s.+/gi, info: 'Facemoods was found in line' },
    {
      regex: /.+\sSearch.yac.mx\s.+/gi,
      info: 'Search.yac.mx was found in line'
    },
    {
      regex: /.+\sFinallyFast\s.+/gi,
      info: 'FinallyFast was found in line'
    },
    { regex: /.+\sSearchqu\s.+/gi, info: 'Searchqu was found in line' },
    {
      regex: /.+\sFindWideSearch\s.+/gi,
      info: 'FindWideSearch was found in line'
    },
    {
      regex: /.+\sSecure Trusted\s.+/gi,
      info: 'Secure Trusted was found in line'
    },
    {
      regex: /.+\sFreeSoftToday\s.+/gi,
      info: 'FreeSoftToday was found in line'
    },
    {
      regex: /.+\sSeverWeatherAlerts\s.+/gi,
      info: 'SeverWeatherAlerts was found in line'
    },
    { regex: /.+\sFunmoods\s.+/gi, info: 'Funmoods was found in line' },
    {
      regex: /.+\sSlowPCFighter\s.+/gi,
      info: 'SlowPCFighter was found in line'
    },
    { regex: /.+\sGenieo\s.+/gi, info: 'Genieo was found in line' },
    { regex: /.+\sSm23mS\s.+/gi, info: 'Sm23mS was found in line' },
    { regex: /.+\sGolsearch\s.+/gi, info: 'Golsearch was found in line' },
    { regex: /.+\sSofttango\s.+/gi, info: 'Softtango was found in line' },
    { regex: /.+\sHao123\s.+/gi, info: 'Hao123 was found in line' },
    {
      regex: /.+\sSomoto Ltd.\s.+/gi,
      info: 'Somoto Ltd. was found in line'
    },
    { regex: /.+\sHD-V2.2\s.+/gi, info: 'HD-V2.2 was found in line' },
    {
      regex: /.+\sSpeedupmypc\s.+/gi,
      info: 'Speedupmypc was found in line'
    },
    {
      regex: /.+\sHostSecurePlugin\s.+/gi,
      info: 'HostSecurePlugin was found in line'
    },
    { regex: /.+\sSpigot\s.+/gi, info: 'Spigot was found in line' },
    {
      regex: /.+\sIAC Search & Media\s.+/gi,
      info: 'IAC Search & Media was found in line'
    },
    { regex: /.+\sSS8\s.+/gi, info: 'SS8 was found in line' },
    { regex: /.+\sIlivid\s.+/gi, info: 'Ilivid was found in line' },
    {
      regex: /.+\sStrongvault\s.+/gi,
      info: 'Strongvault was found in line'
    },
    { regex: /.+\sIminent\s.+/gi, info: 'Iminent was found in line' },
    { regex: /.+\sSuperfish\s.+/gi, info: 'Superfish was found in line' },
    {
      regex: /.+\sIncredibar\s.+/gi,
      info: 'Incredibar was found in line'
    },
    { regex: /.+\sSweetIM\s.+/gi, info: 'SweetIM was found in line' },
    { regex: /.+\sInfoadams\s.+/gi, info: 'Infoadams was found in line' },
    {
      regex: /.+\sSweetpacks\s.+/gi,
      info: 'Sweetpacks was found in line'
    },
    { regex: /.+\sInfoSpace\s.+/gi, info: 'InfoSpace was found in line' },
    {
      regex: /.+\sTarma Installer\s.+/gi,
      info: 'Tarma Installer was found in line'
    },
    {
      regex: /.+\sInstallBrain\s.+/gi,
      info: 'InstallBrain was found in line'
    },
    {
      regex: /.+\sTranslategenius\s.+/gi,
      info: 'Translategenius was found in line'
    },
    {
      regex: /.+\sInternetCorkBoard\s.+/gi,
      info: 'InternetCorkBoard was found in line'
    },
    { regex: /.+\sTuvaro\s.+/gi, info: 'Tuvaro was found in line' },
    { regex: /.+\sIsearch\s.+/gi, info: 'Isearch was found in line' },
    { regex: /.+\sVgrabber\s.+/gi, info: 'Vgrabber was found in line' },
    {
      regex: /.+\sJfileManager 7\s.+/gi,
      info: 'JfileManager 7 was found in line'
    },
    {
      regex: /.+\sVisicom Media Inc.\s.+/gi,
      info: 'Visicom Media Inc. was found in line'
    },
    {
      regex: /.+\sJollyWallet\s.+/gi,
      info: 'JollyWallet was found in line'
    },
    { regex: /.+\sVPlay\s.+/gi, info: 'VPlay was found in line' },
    {
      regex: /.+\sLevel Quality Watcher\s.+/gi,
      info: 'Level Quality Watcher was found in line'
    },
    { regex: /.+\sWajam\s.+/gi, info: 'Wajam was found in line' },
    {
      regex: /.+\sMediaVideosPlayers\s.+/gi,
      info: 'MediaVideosPlayers was found in line'
    },
    {
      regex: /.+\sWeb Assistant\s.+/gi,
      info: 'Web Assistant was found in line'
    },
    {
      regex: /.+\sMindspark Interactive\s.+/gi,
      info: 'Mindspark Interactive was found in line'
    },
    {
      regex: /.+\sWebCake Deals & Ad’s\s.+/gi,
      info: 'WebCake Deals & Ad’s was found in line'
    },
    {
      regex: /.+\sMonterra Inc.\s.+/gi,
      info: 'Monterra Inc. was found in line'
    },
    {
      regex: /.+\sWhitesmoke\s.+/gi,
      info: 'Whitesmoke was found in line'
    },
    {
      regex: /.+\sMoshe Caspi\s.+/gi,
      info: 'Moshe Caspi was found in line'
    },
    {
      regex: /.+\sWord Proser\s.+/gi,
      info: 'Word Proser was found in line'
    },
    {
      regex: /.+\sMyBrowserbar\s.+/gi,
      info: 'MyBrowserbar was found in line'
    },
    { regex: /.+\sYontoo\s.+/gi, info: 'Yontoo was found in line' },
    {
      regex: /.+\sMyInfotopia\s.+/gi,
      info: 'MyInfotopia was found in line'
    },
    { regex: /.+\sZugo Ltd\s.+/gi, info: 'Zugo Ltd was found in line' }
]

const av = [
  {regex:/.+\savast\s.+/gi, info:"avast antivirus"},
  {regex:/.+\sAVG\s.+/gi, info:"AVG antivirus"},
  {regex:/.+\sAvira\s.+/gi, info:"Avira antivirus"},
  {regex:/.+\sBitdefender\s.+/gi, info:"Bitdefender antivirus"},
  {regex:/.+\sZoneAlarm\s.+/gi, info:"ZoneAlarm antivirus"},
  {regex:/.+\sImmunet\s.+/gi, info:"Immunet antivirus"},
  {regex:/.+\sClamWin\s.+/gi, info:"ClamWin antivirus"},
  {regex:/.+\sComodo\s.+(antivirus|security)*.+/gi, info:"Comodo antivirus"},
  {regex:/.+\sDr.Web\s.+(antivirus|security)*.+/gi, info:"Dr.Web antivirus"},
  {regex:/.+\sESET\s.+(antivirus|security)*.+/gi, info:"ESET antivirus"},
  {regex:/.+\sNorton\s.+(antivirus|security)*.+/gi, info:"Norton lifelock antivirus"},
  {regex:/.+\sMcAfee\s.+(antivirus|security)*.+/gi, info:"McAfee antivirus"},
  {regex:/.+\sPanda\s.+(antivirus|security)*.+/gi, info:"Panda antivirus"},
  {regex:/.+\sF-Secure\s.+(antivirus|safe)*.+/gi, info:"F-Secure antivirus"},
  {regex:/.+\sG DATA\s.+(antivirus|Security)*.+/gi, info:"G DATA antivirus"},
  {regex:/.+\sSophos\s.+(antivirus|protection)*.+/gi, info:"Sophos antivirus"},
  {regex:/.+\sTitanium\s.+(antivirus|protection)*.+/gi, info:"Trend Micro antivirus"},
  {regex:/.+\sF-PROT\s.+/gi, info:"F-PROT antivirus"},
  {regex:/.+\sFortiClient\s.+/gi, info:"FortiClient antivirus"},
  {regex:/.+Spyware Doctor with AntiVirus.+/gi, info:"Norton lifelock antivirus"},
  {regex:/.+\sKaspersky\s.+(security)*.+/gi, info:"Kaspersky antivirus"},
  {regex:/.+\s360 Total\s.+(security)*.+/gi, info:"Qihoo 360 antivirus"},
  {regex:/.+\sNANO\s.+(antivirus)*.+/gi, info:"NANO antivirus"},
  {regex:/.+\sVba32\s.+(antivirus)*.+/gi, info:"VirusBlokAda antivirus"},
  {regex:/.+\sTrustPort\s.+(antivirus|security|protection)*.+/gi, info:"TrustPort antivirus"},
]



var internetInfo = [
  {regex:/^.+Ping statistics.*[\r\n\s\S]{2}.+(packets:).+[\s\S].*[\s\S].+/img , info:"Ping statistics"},
  {regex:/({"requestedHost").+(:".*")/ig , info:"Ping Results" },
  {regex:/({"downloadspeed").+bwserverid.*("?:\d*"?})/ig , info:"BandWidth stats"},
  {regex:/.*(time\s?outs).*/ig , info:"TimeOuts"},
]
var scanInfo = [
  {regex:/^(====Error at )[\s\S\r\n]+(==== End Error Sysinfo ====)$/gim , info:"Scan Error"}, // grabs line before and after trace file // probobly will need to tweek
  {regex:/^.+(skipping).*(function).+/igm , info:"Tests that were skipped"}, // find skipping function logic 
  {regex:/^.*(av control).*/igm , info:"Av3 control status. If not up to date exterminate scan will skip or fail"} ,
  {regex:/^.*(email).*(exit).*(ok)?.*/igm , info:"Email sent?"} ,
  

]
var scheduledScan = [
  //{regex:/^.+(skipping).*(function).*[\s\S].+/igm , info:"Tests that were skipped"},
  {regex:/^.*(Results from email.asp).*/igm , info:"Will let you know if schedule scan email was sent"} ,
  {regex:/.*(Emailing results to:).*[\r\n\s\S]{2}.+/igm , info:"Email results"} ,
  {regex:/^.*(Scheduler Exit:).*/igm , info:"Will let you know if schedule scan finished with no problem"} ,
  {regex:/.+(doneTestingShowDashboard)[\r\n\s\S]{2}.*emailing\sresults.+/ig , info:"Scan successfully completed"} ,
  {regex:/^.*(ajax POST to https:\/\/utilities.pcpitstop.com\/Nirvana\/SaveScheduledScanEventLog\.asp).*[\s\S].+/igm , info:"If error not equal to zero there was a problem posting results"} ,
]

var checkCheckScheduler = [
  {regex:/.+(cannot update activex).+/ig,info:"Active X issues"},
  {regex:/.+scan due in.+[\r\n\s\S]{2}.+/ig,info:"scheduler is working correctly if time is present </br> If 0 means that scan is not set or about to run"},
  {regex:/.+(installed .net framework versions:).+/ig,info:"If everything is true .net is good"}
]

var protectionStatus =[
  {regex:/.+(client received protection status)\s0.+/ig,info:"Green shield"},
  {regex:/.+(client received protection status)\s1.+/ig,info:"vulnerable update available"},
  {regex:/.+(client received protection status)\s2.+/ig,info:"Definitions updating"},
  {regex:/.+(client received protection status)\s3.+/ig,info:"Definitions failed"},
  {regex:/.+(client received protection status)\s4.+/ig,info:"Super Shield paused"},
  {regex:/.+(client received protection status)\s5.+/ig,info:"Super shield not licensed"},
  {regex:/.+(client received protection status)\s6.+/ig,info:"Super shield starting"},
  {regex:/.+(client received protection status)\s7.+/ig,info:"Protection is off"},
  {regex:/.+(client received protection status)\s8.+/ig,info:"RT service unavailable"},
  {regex:/.+(client received protection status)\s9.+/ig,info:"Cannot connect to RT service"},
]

async function redSSdiagnosisFunction(){
  const pathToDirectory = require('./dialog.js')
  const filePath = pathToDirectory.pathToDirectory
  const returnObj = []
  try {
    console.log(`${filePath}sysinfo.log`)
    var file = await readFile(`${filePath}sysinfo.log`)
    // console.log(file,"file",typeof(file))
    var bufFile = Buffer.from(file)
    // console.log(bufFile,"buffile")
    var encoding = detect(bufFile);
    //changes enconding if not utf8
    var actualString = decode(bufFile, encoding).toString('utf8');
    // console.log(actualString,"actual string",typeof(actualString))
    var autorunSectionReg = /((==== Autoruns)[\t\r\s\S]+(==== Add))/i
    var sysEventSectionReg = /((==== System EventLog ====)[\t\r\s\S]+(==== Application))/i
    var faultBucketSectionReg = /((==== Application EventLog ====)[\t\r\s\S]+(==== end))/i
    // var autorunSectionLog = actualString.match(autorunSectionReg)[0]
    var autorunSectionLog = autorunSectionReg.exec(actualString) 

    // console.log(autorunSectionLog,"autorunSectionlog")
    // var sysEventSectionlog = actualString.match(sysEventSectionReg)
    var sysEventSectionlog = sysEventSectionReg.exec(actualString)
    // console.log(sysEventSectionlog, "sysEventSection")
    
    // console.log(sysEventSectionlog,"syseventsectionlog")

    var faultBucketSectionlog = faultBucketSectionReg.exec(actualString)
    // console.log(faultBucketSectionlog, "faultBucketSectionlogs")
   
    var autoresult = await autoRunData(autorunSectionLog)
    var sysEventResult = await eventLogData(sysEventSectionlog)
    var faultBucketResult = await faultBucketData(faultBucketSectionlog)

   
    returnObj.push(autoresult)
    returnObj.push(sysEventResult)
    returnObj.push(faultBucketResult)

    return returnObj
  } catch (error) {
    console.log(error)
  }
  // return description and matches key
  
}

async function faultBucketData(section){
  if(section == null) return{description:"No fault bucket items in sysinfo.log", matches:""}
  var reg1 =/.+(fault bucket).+rtservice.exe.+/gi
  var string = section.toString()
  var match = string.match(reg1)
  if (match) return {description:"will contain info about rt service crashing",matches:match}
  return{description:"rt service.exe not found in fault bucket", matches:"no crash items found"}
}

async function autoRunData (section){
  if(section == null) return{description:"no autorun items in sysinfo.log", matches:""}
  var string = section.toString()
  var reg1 =/.+PCMaticRT.exe.+/gi 
  var match = string.match(reg1)
  if(match) return {description:"Supershield found in autoruns(suggest SS is starting correctly)",matches:match}
  return{description:"SuperShield not found in autoruns",matches:"Failure to see it here suggests something is removing it or possible not installed"}
}

async function eventLogData(section){
  var reg1 =/.+rtservice.exe.+/gi
  var string = section.toString()
  var match = string.match(reg1)
  if(match){ return{description:"This section will tell you if the SS service is in fact stopping and how many times. Look at the time stamps",matches:match}}
  return{description:"rtservice.exe not found in system event log",matches:"No events captured of SS stopping"}
}


let logFileTypeMatches = {
    ss: [
        {regex:redSSdiagnosisFunction,desription:"SuperShield"},
        {regex:/.+[\t\r\s\S].+(err).+[\t\r\s\S].+(Setting icon color: red).+[\t\r\s\S].+.+[\t\r\s\S].+[\t\r\s\S].+/ig ,description:"SuperShield errors"},// not sure if this is correct. 
        {regex:/.+(Customer clicked).+[\r\n\s\S]{2}.+/ig ,description:"User Actions"}// not sure if this is correct. 
        // {regex:protectionStatus ,description:"Protection Status items"}// not sure if this is correct. 

    ],
    ScheduleScanLog: [
      {regex:scanInfo ,description:"Potential Scan Issues"},
      {regex:internetInfo ,description:"Internet"},
      {regex: scheduledScan ,description:"Scheduled scan indicators"}
    ],
    checkScheduler:[
        {regex:checkCheckScheduler ,description:"Check scheduler issues"}
      
       
    ],
    systemInfo:[
        {regex: pup , description:"Potential PUPs"},
        {regex: /.+vpn.+/gi, description: "VPN indications"},
        {regex: av, description:"Av traces Found"},
        {regex:/.+(windowsupdatefailure).+/gi, description:"Update Failures"},
        {regex: /.+fault\sbucket.+/gi, description: "Fault Bucket Items"},
        {regex: /\s{2}\d{12}\s1\s.+/g, description: "Critical Errors"},
        {regex:/.+\ssecurityCenter\s.+/gi, description:"Security Center items"}
    ],
    pcmaticScanLog: [
        {regex:scanInfo ,description:"Scan issues"},
        {regex:internetInfo ,description:"Internet"}
    ]
}

//logFileTypeMatches.systemInfo = [...logFileTypeMatches.systemInfo, ...avlist];




module.exports.logFileTypeMatches= logFileTypeMatches;
;