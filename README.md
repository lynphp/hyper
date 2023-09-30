# hyper
TO use Hyper in any HTML element, just use `hyper` standalone attribute.

Example #1: Replacing the `div#main` with html response from `/page` `POST` request. `replace` means, it will replace the specified element.
```html
    <button type="submit" hyper with="POST:/page" on="click" replace="#main">Replace</button>
    <div id="main"></div>
```
Example #2: Refresh the list of `option` during page load
```html
    <select hyper with="GET:/options.php" id="main-select"></select>
```
Example #3:
Listen to `select#main-select` `onchange` event to refresh the `option`'s list of `select#sub-select` with additional URL parameter from `data-filter`. 
Here we use `bind` directive to get the selected value of `select#main-select`
```html
    <select hyper
            with="GET:/options.php"
            id="sub-select"
            listen="#main-select:onchange"
            data-filter="bind:#main-select">
    </select>
```
Assuming the selected value of `select#main-select` is `option1`, with above example, the server must return an HTML response to the `GET` request, `/options.php?filter=option1`. 

Example #4: Is similar to Example #3 with additional data filters
```html
    <select hyper
            with="GET:/options.php"
            id="sub-cat-select"
            listen="#sub-select:onchange"
            data-filter1="bind:#main-select"
            data-filter2="bind:#sub-select">
    </select>
```
Example #5: Is similar to Example #1 but using `fill` directive. This will set the innerHTML of the desired element.
```html
    <button type="submit"
            hyper
            with="POST:/"
            on="click"
            fill="#main">Fill</button>
```
