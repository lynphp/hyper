window.http=(()=>{
    let config = {
        name:'http',
    }
    let responseSelector=(target, mode, url)=>{
        return {
                getElementById: async (qualifiedElementId) => {
                    let  content = await http.fetchFragment(url)
                    let doc = new DOMParser().parseFromString(content, 'text/html')
                    let elem = doc.getElementById(qualifiedElementId);
                    populate.populate(document.querySelector(target), mode, elem.outerHTML);
                },
                querySelector: async (qualifiedSelector) => {
                    let  content = await http.fetchFragment(url)
                    let doc = new DOMParser().parseFromString(content, 'text/html')
                    populate.populate(document.querySelector(target), mode, doc.querySelector(qualifiedSelector));
                },
                querySelectorAll: async(target, qualifiedSelector) => {
                    let  content = await http.fetchFragment(url)
                    document.querySelectorAll(qualifiedSelector).forEach((elem) => {
                        populate.populate(elem, mode, content);
                    })
                },
                getElementsByClassName: async(qualifiedClassName) => {
                    let  content = await http.fetchFragment(url)
                    let elems = document.getElementsByClassName(qualifiedClassName)
                    for (let i = 0; i < elems.length; i++) {
                        populate.populate(elems[i], mode, content);
                    }
                },
                getResponse:async ()=>{
                    return content
                }
        }
    }
    let afterFetch=(url)=>{
        return {
            fill: (target)=>{
                return responseSelector(target,'fill', url)
            },
            replace:(target)=>{
                return responseSelector(target, 'fill', url)
            },
            append:(target)=>{
                return responseSelector(target,'append', url)
            },
            prepend:(target)=>{
                return responseSelector(target,'prepend', url)
            },
            auto:()=>{
                populate.populate('', 'auto', url);
            },
            getResponse:async ()=>{
                return content
            }
        }
    }
    let methods = {
        get: (url) => {
            return afterFetch(url)
        },
    }
    return {
        methods:methods,
        getName: () => {
            return config.name
        },
        inject:(module)=>{
            http[module.getName()]=module
        },
        init: async () => {
            await fragment.registerDependency('populate', http)
        },
        dependencyAdded: (dependency) => {

        },
        handle: (frgmnt) => {

        },
        fetchFragment:async (url)=> {
            const request = new Request(url, {
                method: 'GET',
                mode: "no-cors",
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml",
                    "X-fragment-power": 'fragment',
                    "Access-Control-Allow-Origin": "*"
                }
            });
            const  getAndWait =async (request)=> {
                return await fetch(request).then( (response) =>{
                    return response.text();
                }).catch(function (err) {
                    console.log('Failed to fetch page: ', err)
                    return ''
                });
            }
            return getAndWait(request)
        },

    }
})()