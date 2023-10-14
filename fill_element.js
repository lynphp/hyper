window.fill_element={
    name:'stream',
    _trigger:'stream-trigger',
    _fetch:'stream-fetch',
    init:()=>{
        fragment.events.subscribe(fragment.events.ajax_start,fill_element.startLog)
        fragment.events.subscribe(fragment.events.ajax_end,fill_element.endLog)
    },
    startLog:(frgmnt)=>{
        console.log('startLog')
    },
    endLog:(frgmnt)=>{
        console.log('endLog')
    },
    populate:(frgmnt, html)=>{

    }
}