

function clearDomShowLoading (){
    //document.querySelector('#content').innerHTML = "";
    const loading = document.querySelector('#loading');
    const header = document.querySelector('.header');   
    const infoText = document.querySelector('.informationText');
    const content = document.getElementById('content');
    content.innerHTML= "";
    infoText.innerHTML ="";
    header.innerHTML = ""; 
   
    loading.classList.remove('hidden');
    
  }


function clearPageForLoading (){
   $("#loading").removeClass('hidden');
    
}

function finishedLoading (){
    $("#loading").addClass('hidden');
}