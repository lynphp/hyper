/**
 * fragment="<modules>"
 * fragment-trigger="visible"
 * visibility-fetch="GET:/url"
 * visibility-fill="#elementId"
 * visibility-replace="#elementId"
 * visibility-fill=".className"
 * visibility-replace=".className"
 */
window.visibility = (()=> {
    let config = {
        name: 'visibility',
        _attrFill: 'visible-fill',
        _attrReplace: 'visible-replace',
        _attrAppend: 'visible-append',
        _attrPrepend: 'visible-prepend',
        _attrAuto: 'visible-auto',
        _attrFetch: 'visible-fetch',
        _attrRemove: 'not-visible-remove',//not implemented
        _scrollDebounceRate: 10,
        visibility: {
            visible: 'visible',
            not_visible: 'not-visible'
        },
    }
    let state={
        _elementStates: [],
        _elements: [],
        _elementsState: [],
    }
    let internalAPI=(()=> {
        return {
            populate: null,
            checkElement: (frgmnt) => {
                if (internalAPI.isElementInViewport(frgmnt)) {
                    if (state._elementsState[frgmnt.id + '.visible'] === undefined) {
                        state._elementsState[frgmnt.id + '.visible'] = config.visibility.visible
                        frgmt.events.publish(frgmnt.id + '.visible', frgmnt)
                    }
                } else {
                    state._elementsState[frgmnt.id + '.not-visible'] = config.visibility.not_visible
                    frgmt.events.publish(frgmnt.id + '.not-visible', frgmnt)
                }
            },
            handle: async (frgmnt) => {
                internalAPI.register(frgmnt)
                frgmnt.getAttribute('fragment-trigger').split('|').forEach((trg) => {
                    if (trg === 'visible') {
                        frgmt.events.subscribe(frgmnt.id + '.visible', internalAPI.handleVisible)
                    } else if (trg === 'not-visible') {
                        frgmt.events.subscribe(frgmnt.id + '.not-visible', internalAPI.handleNotVisible)
                    }
                })
                if (frgmnt.hasAttr(config._attrFetch)) {
                    await frgmt.registerDependency('fetcher', visibility);
                }
                if (internalAPI.getPopulateMode(frgmnt) !== '') {
                    await frgmt.registerDependency('populate', visibility);
                }
            },
            /**
             * run once
             * @param frgmnt
             */
            handleVisible: async (frgmnt) => {
                if (state._elementStates[frgmnt.id + '.visible'] === undefined) {
                    state._elementStates[frgmnt.id + '.visible'] = true;
                    let response = await internalAPI.fetch(frgmnt, config._attrFetch);
                    let mode = internalAPI.getPopulateMode(frgmnt)
                    let target = internalAPI.getTarget(frgmnt, 'visible')
                    internalAPI.populate(target, mode, response)
                }
                //console.log('checking ',frgmnt.id+'.visible')
            },
            getTarget: (frgmnt, event) => {
                let mode = internalAPI.getPopulateMode(frgmnt);
                let target = frgmnt.getAttribute(event + '-' + mode)
                if (target !== 'self') {
                    if (target.indexOf(':') === 0) {
                        if (target.startsWith('#')) {
                            return document.getElementById(target);
                        } else if (target.startsWith('.')) {
                            if (document.getElementsByClassName(target) > 0) {
                                return document.getElementsByClassName(target)[0]
                            }
                        } else if (target.startsWith('.')) {
                            return document.querySelector(target);
                        }
                    } else if (target.indexOf(':') > 0) {
                        let targetParts = target.split(':')
                        if (targetParts[1].startsWith('#')) {
                            return document.getElementById(target);
                        } else if (targetParts[1].startsWith('.')) {
                            let elments = document.getElementsByClassName(target);
                            if (targetParts[0] === 'first') {
                                return elments[0]
                            } else if (targetParts[0] === 'last') {
                                return elments[elments.length - 1]
                            }
                        } else {
                            let elments = document.querySelectorAll(target);
                            if (targetParts[0] === 'first') {
                                return elments[0]
                            } else if (targetParts[0] === 'last') {
                                return elments[elments.length - 1]
                            }
                        }
                    }
                } else {
                    return frgmnt
                }
            },
            getPopulateMode: (frgmnt) => {
                if (frgmnt.hasAttribute(config._attrFill)) {
                    return 'fill'
                }
                if (frgmnt.hasAttribute(config._attrReplace)) {
                    return 'replace'
                }
                if (frgmnt.hasAttribute(config._attrAppend)) {
                    return 'append'
                }
                if (frgmnt.hasAttribute(config._attrPrepend)) {
                    return 'prepend'
                }
                if (frgmnt.hasAttribute(config._attrAuto)) {
                    return 'auto'
                }
                return '';
            },
            /**
             * run once
             * @param frgmnt
             */
            handleNotVisible: (frgmnt) => {
            },
            register: (frgmnt) => {
                let exist = false;
                state._elements.forEach((value) => {
                    if (frgmnt.id === value) {
                        exist = true;
                    }
                })
                if (!exist) {
                    state._elements[state._elements.length] = frgmnt.id
                }
            },
            isElementInViewport: (frgmnt) => {
                let rect = frgmnt.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            },
            endLog: (frgmnt) => {
                console.log('endLog')
            },
            checkElements: () => {
                state._elements.forEach((elemId) => {
                    internalAPI.checkElement(document.getElementById(elemId));
                })
            },
        }
        })();

        return {
            getName:()=>{
              return config.name;
            },
            init: async () => {
                //fragment.events.registerTopic('visibility_changed');
                //fragment-trigger="visible"
                frgmt.registerTriggerHandler('visible', internalAPI.handle);
                //fragment-trigger="not-visible"
                frgmt.registerTriggerHandler('not-visible', internalAPI.handle);
                const debouncedFunction = frgmt.debounce(internalAPI.checkElements, config._scrollDebounceRate);
                window.addEventListener("scroll", debouncedFunction);
                console.log('init');
            },
            dependencyAdded: (dependency) => {
                if (dependency.getName() === 'populate') {
                    internalAPI.populate = dependency.populate;
                    internalAPI.checkElements();
                } else if (dependency.getName() === 'fetcher') {
                    internalAPI.fetch = dependency.fetch;
                }
            },
        }
})()