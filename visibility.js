/**
 * fragment="<modules>"
 * fragment-trigger="visible"
 * visibility-fetch="GET:/url"
 * visibility-fill="#elementId"
 * visibility-replace="#elementId"
 * visibility-fill=".className"
 * visibility-replace=".className"
 */
const visibility={
    name:'visibility',
    _attrFill:'visibility-fill',
    _attrReplace:'visibility-replace',
    _elements:[],
    _elementsState:[],
    _handlers:[],
    states:{
        visible:'visible',
        not_visible:'not-visible'
    },
    init:async ()=>{
        fragment.events.registerTopic('visibility_changed');
        //fragment-trigger="visible"
        fragment.registerTriggerHandler('visible',visibility.handle);
        //fragment-trigger="not-visible"
        fragment.registerTriggerHandler('not-visible',visibility.handle);
        await fragment.registerDependency('stream');
        const debouncedFunction =  fragment.debounce(visibility.checkElements,10);

        window.addEventListener("scroll", debouncedFunction);
        fragment.events.subscribe(fragment.events.init_yours,visibility.register, visibility.name);
        console.log('init');
    },
    checkElements:()=>{
        visibility._elements.forEach((elemId)=>{
            if (visibility.isElementInViewport(document.getElementById(elemId))) {
                visibility._elementsState[elemId]=visibility.states.visible
            } else {
                visibility._elementsState[elemId]=visibility.states.not_visible
            }
        })
    },
    handle:async (frgmnt)=>{
        if(frgmnt.hasAttribute('visibility-fill')){
            await fragment.registerDependency('fill_element');
        }
        if(frgmnt.hasAttribute('visibility-replace')){
            await fragment.registerDependency('replace_element');
        }
    },
    register:(frgmnt)=>{
        visibility._elements[visibility._elements.length]=frgmnt.id
    },
    isElementInViewport:(frgmnt)=>{
        let rect = frgmnt.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    endLog:(frgmnt)=>{
        console.log('endLog')
    }
}
fragment?.tryRun(visibility);