const logger={
    name:'logger',
    _progressText:'logger-elem',
    init:()=>{
        fragment.events.subscribe(fragment.events.ajax_start,logger.startLog)
        fragment.events.subscribe(fragment.events.ajax_end,logger.endLog)
    },
    startLog:(frgmnt)=>{
        console.log('startLog')
    },
    endLog:(frgmnt)=>{
        console.log('endLog')
    }
}
fragment?.tryRun(progress);