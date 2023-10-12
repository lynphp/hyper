const progress={
    name:'progress',
    _progressText:'progress-text',
    elemOrigInnerText:[],
    init:()=>{
        fragment.events.subscribe(fragment.events.ajax_start,progress.startProgress)
        fragment.events.subscribe(fragment.events.ajax_end,progress.endProgress)
    },
    startProgress:(frgmnt)=>{
        if(frgmnt.nodeName==='BUTTON'){
            if(progress.elemOrigInnerText[frgmnt.id]===undefined){
                progress.elemOrigInnerText[frgmnt.id] = frgmnt.innerText
            }
            if(frgmnt.hasAttribute(progress._progressText)){
                frgmnt.innerText=frgmnt.getAttribute(progress._progressText)
            }else{
                frgmnt.innerText='start progress'
            }
        }
    },
    endProgress:(frgmnt)=>{
        if(frgmnt.nodeName==='BUTTON'){
            if(frgmnt.hasAttribute(progress._progressText)){
                frgmnt.innerText=progress.elemOrigInnerText[frgmnt.id]
            }else{
                frgmnt.innerText='end progress'
            }
        }
    },
    handle:(frgmnt)=>{
        console.log('progress')
    }
}
fragment?.tryRun(progress);