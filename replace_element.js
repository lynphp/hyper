const replace_element={
    name:'stream',
    _trigger:'stream-trigger',
    _fetch:'stream-fetch',
    init:()=>{
        fragment.events.subscribe(fragment.events.ajax_start,replace_element.startLog)
        fragment.events.subscribe(fragment.events.ajax_end,replace_element.endLog)
    },
    startLog:(frgmnt)=>{
        console.log('startLog')
    },
    endLog:(frgmnt)=>{
        console.log('endLog')
    },
    populate:(frgmnt, html)=>{
        frgmnt.replaceWith(html)
    }
}
fragment?.tryRun(replace_element);