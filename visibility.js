/**
 * fragment="<modules>"
 * fragment-trigger="visible"
 * visibility-fetch="GET:/url"
 * visibility-fill="#elementId"
 * visibility-replace="#elementId"
 * visibility-fill=".className"
 * visibility-replace=".className"
 */
window.visibility = {
    name:'visibility',
    _attrFill:'visible-fill',
    _attrReplace:'visible-replace',
    _attrAppend:'visible-append',
    _attrPrepend:'visible-prepend',
    _attrAuto:'visible-auto',
    _attrFetch:'visible-fetch',
    _attrRemove:'not-visible-remove',//not implemented
    _elementStates:[],
    _elements:[],
    _elementsState:[],
    _scrollDebounceRate:10,
    states:{
        visible:'visible',
        not_visible:'not-visible'
    },
    init:async ()=>{
        //fragment.events.registerTopic('visibility_changed');
        //fragment-trigger="visible"
        fragment.registerTriggerHandler('visible',visibility.handle);
        //fragment-trigger="not-visible"
        fragment.registerTriggerHandler('not-visible',visibility.handle);
        const debouncedFunction =  fragment.debounce(visibility.checkElements,visibility._scrollDebounceRate);
        window.addEventListener("scroll", debouncedFunction);
        console.log('init');
    },
    dependencyAdded:(dependency)=>{
        if(dependency.name==='populate'){
            visibility.populate=dependency.populate;
            visibility.checkElements();
        }else if(dependency.name==='fetcher'){
            visibility.fetch=dependency.fetch;
        }
    },
    checkElements:()=>{
        visibility._elements.forEach((elemId)=>{
            visibility.checkElement(document.getElementById(elemId));
        })
    },
    checkElement:(frgmnt)=>{
        if (visibility.isElementInViewport(frgmnt)) {
            if(visibility._elementsState[frgmnt.id+'.visible']===undefined){
                visibility._elementsState[frgmnt.id+'.visible']=visibility.states.visible
                fragment.events.publish(frgmnt.id+'.visible',frgmnt)
            }
        } else {
            visibility._elementsState[frgmnt.id+'.not-visible']=visibility.states.not_visible
            fragment.events.publish(frgmnt.id+'.not-visible',frgmnt)
        }
    },
    handle:async (frgmnt)=>{
        visibility.register(frgmnt)
        frgmnt.getAttribute('fragment-trigger').split('|').forEach((trg)=>{
            if(trg ==='visible'){
                fragment.events.subscribe(frgmnt.id+'.visible',visibility.handleVisible)
            }else if(trg ==='not-visible'){
                fragment.events.subscribe(frgmnt.id+'.not-visible',visibility.handleNotVisible)
            }
        })
        if(frgmnt.hasAttribute(visibility._attrFetch)){
            await fragment.registerDependency('fetcher',visibility);
        }
        if(visibility.getPopulateMode(frgmnt)!==''){
            await fragment.registerDependency('populate',visibility);
        }
    },
    /**
     * run once
     * @param frgmnt
     */
    handleVisible:async (frgmnt)=>{
        if (visibility._elementStates[frgmnt.id+'.visible']===undefined) {
            visibility._elementStates[frgmnt.id+'.visible']=true;
            let response = await visibility.fetch(frgmnt, visibility._attrFetch);
            let mode = visibility.getPopulateMode(frgmnt)
            let target = visibility.getTarget(frgmnt,'visible')
            visibility.populate(target, mode, response)
        }
        //console.log('checking ',frgmnt.id+'.visible')
    },
    getTarget:(frgmnt, event)=>{
        let mode = visibility.getPopulateMode(frgmnt);
        let target = frgmnt.getAttribute(event + '-' + mode)
        if(target !== 'self'){
            if(target.indexOf(':') === 0){
                if(target.startsWith('#')){
                    return document.getElementById(target);
                }else if(target.startsWith('.')){
                    if(document.getElementsByClassName(target)>0){
                        return document.getElementsByClassName(target)[0]
                    }
                }else if(target.startsWith('.')){
                    return document.querySelector(target);
                }
            }else if(target.indexOf(':') > 0){
                let targetParts = target.split(':')
                if(targetParts[1].startsWith('#')){
                    return document.getElementById(target);
                }else if(targetParts[1].startsWith('.')){
                    let elments =  document.getElementsByClassName(target);
                    if(targetParts[0] === 'first'){
                        return elments[0]
                    } else if (targetParts[0] === 'last'){
                        return elments[elments.length - 1]
                    }
                }else{
                    let elments = document.querySelectorAll(target);
                    if(targetParts[0] === 'first'){
                        return elments[0]
                    } else if (targetParts[0] === 'last'){
                        return elments[elments.length - 1]
                    }
                }
            }
        }else{
            return frgmnt
        }
    },
    getPopulateMode:(frgmnt)=>{
        if(frgmnt.hasAttribute(visibility._attrFill)) {
            return 'fill'
        }
        if(frgmnt.hasAttribute(visibility._attrReplace)) {
            return 'replace'
        }
        if(frgmnt.hasAttribute(visibility._attrAppend)) {
            return 'append'
        }
        if(frgmnt.hasAttribute(visibility._attrPrepend)) {
            return 'prepend'
        }
        if(frgmnt.hasAttribute(visibility._attrAuto)) {
            return 'auto'
        }
        return '';
    },
    /**
     * run once
     * @param frgmnt
     */
    handleNotVisible:(frgmnt)=>{
    },
    register:(frgmnt)=>{
        let exist = false;
        visibility._elements.forEach((value)=>{
            if(frgmnt.id === value){
                exist=true;
            }
        })
        if(!exist){
            visibility._elements[visibility._elements.length]=frgmnt.id
        }
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