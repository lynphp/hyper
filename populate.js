window.populate=(()=> {
    const config = {
        name: 'populate',
    }
    return  {
        init: () => {
        },
        getName:()=>{
            return config.name;
        },
        isHTML: (content) => {
            let elem = document.createElement('div');
            elem.innerHTML = content;
            return elem.children.length > 0;
        },
        /**
         * xxx-<populate mode> = "<selector target>"
         * xxx-fill=".targetElementClassName"
         * xxx-replace="#targetElementID"
         * xxx-append="<anything that works with querySelector including class and ID>"
         * xxx-prepend="<anything that works with querySelector>"
         * xxx-auto (stand-alone attribute)
         * fill     : will replace the innerHTML or innerText depending on the encoding of the response.
         * replace  : will replace the target element with the response.
         * append   : will add as last sibling to the target
         * prepend  : will add as first sibling to the target
         * auto     : will replace all elements with the same ID based on
         *            all the elements with the ID from the server response
         * * if mode is empty/null or undefined, the operation will work as replace,
         * @param frgmnt HTMLElement as the target element.
         * @param mode fill/replace/auto
         * @param html string
         */
        populate: (frgmnt, mode, html) => {
            let doc = new DOMParser().parseFromString(html, 'text/html')
            doc.querySelectorAll(frgmt.selector).forEach((frgmnt) => {
                setHID(frgmnt)
            })
            html = doc.body.innerHTML
            if (mode === 'fill') {
                if (populate.isHTML(html)) {
                    frgmnt.innerHTML = html;
                } else {
                    frgmnt.innerText = html;
                }
            } else if (mode === 'replace') {
                frgmnt.replaceWith(html);
            } else if (mode === 'append') {
                frgmnt.parent.append(html)
            } else if (mode === 'prepend') {
                frgmnt.parent.prepend(html)
            } else if (mode === 'auto') {
            } else {
                frgmnt.replaceWith(html);
            }
            doc = new DOMParser().parseFromString(html, 'text/html')
            doc.querySelectorAll(frgmt.selector).forEach((frgmnt) => {
                if (document.getElementById(frgmnt.id) !== undefined) {
                    frgmt.handle(document.getElementById(frgmnt.id));
                }
            })

            console.log('populated ' + frgmnt.id);
        }
    }
})();