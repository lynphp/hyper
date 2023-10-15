
# FragmentJS Library Lifecycle
From its name, FragmentJS loads required modules in fragment or one-by-one or little-by-little. If you are creating a module that can be 
integrated with FragmentJS, it is best to understand the flow on how FragmentJS loads, initialize and call your module to action.
1. Must exist in ```fragment``` attribute or one of the API requires them via 
asynchronous request ``` fragment.registerDependency```.
   Once identified as required library by an attribute or another Library, 
Fragment will include them one-by-one by creating a script tag.<br /><br />
2. Fragment will call the module's ```module.init()``` method after the successful mounting.<br /><br />
3. During ```module.init()``` call, the module optionally register a trigger that they handle by calling 
```fragment.registerTriggerHandler```<br /><br />
4. During the ```window.onload``` event, Fragment will read every element that has ```fragment-trigger``` 
attribute, and one-by-one reads their ```fragment-trigger="visible|left-click|right-click"``` and parse them. 
Each module that registered the trigger will be call via their```module.handle(element)``` with HTMLElement as parameter.<br /><br />
5. During the ```handle()``` call, the module will check each element attributes if it includes what they need handle.<br /><br /><br />

<div id="example-1">
**Example:** <br id="hello" />
Let's use the below ```DIV``` element as an example. The element is set to use the module ```visibility.js``` take action when 
visible and another module named ```mouse``` to listen for right click and left click events.
First, in the module ```visibility.js```, when an element is found with ```visible-fetch```, ```visibility.js``` module know
that it needs another module named ```fetcher``` query from a URL when visible. Also, because the attribute ```visible-fill``` also exist,  ```visibility.js``` 
will request another module called ```populate``` to handle the response from the server.

```html
<div fragment="visibility|mouse"
     fragment-trigger="visible|left-click|right-click"
     visible-fetch="GET:/demos/visibility/random-content"
     visible-fill="self"
     mouse-left-click-toggle="#elementModal:style.display=true|delete"
     mouse-right-click-set="varchar:selection=1"
     mouse-right-click-toggle="#elementMenu:style.display=true"
>    
</div>
<div hyper static="true" fetch="GET:/signin/signin-form" on="load"></div>
```
</div>