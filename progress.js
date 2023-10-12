const progress={
    name:'progress',
    _progressText:'progress-text',
    elemOrigInnerText:[],
    init:()=>{
        if(window.fetcher){
            window.fetcher._startProgress=progress.startProgress
            window.fetcher._endProgress=progress.endProgress
        }
    },
    startProgress:(frgmnt)=>{
        if(frgmnt.nodeName==='BUTTON'){
            progress.elemOrigInnerText[frgmnt] = frgmnt.innerText
            frgmnt.style='background-color:red; padding:4px'
            if(frgmnt.hasAttribute(progress._progressText)){
                frgmnt.innerText=frgmnt.getAttribute(progress._progressText)
            }else{
                frgmnt.innerText='start progress'
            }
        }
        console.log('progressing')
    },
    endProgress:(frgmnt)=>{
        if(frgmnt.nodeName==='BUTTON'){
            if(frgmnt.hasAttribute(progress._progressText)){
                frgmnt.innerText=progress.elemOrigInnerText[frgmnt]
            }else{
                frgmnt.innerText='end progress'
            }
            frgmnt.style='background-color:none'
        }
        console.log('end progress')
    },
    handle:(frgmnt)=>{
        console.log('progress')
        console.log(frgmnt)
    }
}
fragment?.tryRun(progress);