const stream={
    name:'stream',
    _trigger:'stream-trigger',
    _fetch:'stream-fetch',
    init:()=>{
        fragment.events.subscribe(fragment.events.ajax_start,stream.startLog)
        fragment.events.subscribe(fragment.events.ajax_end,stream.endLog)
    },
    startLog:(frgmnt)=>{
        console.log('startLog')
    },
    endLog:(frgmnt)=>{
        console.log('endLog')
    }
}
fragment?.tryRun(stream);