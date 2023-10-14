
Example #1: Lazy loading the content of the div
```html
<div fragment="visible|mouse"
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