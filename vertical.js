window.vertical={
    name:'vertical',
    _attrBottom:'vertical-bottom',
    _attrTop:'vertical-top',
    init:()=>{
        fragment.registerTriggerHandler('v-bottom',vertical.handle);
        //fragment-trigger="not-visible"
        fragment.registerTriggerHandler('v-top',vertical.handle);
        window.onscroll = function (ev) {
            if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
                fragment.events.publish('v-bottom')
            }
            if(window.scrollY===0){
                fragment.events.publish('v-top')
            }
        };
    },
    handle:(frgmnt)=>{

    }
}