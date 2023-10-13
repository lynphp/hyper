<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script defer src="/fragment.js" ></script>
    <title>ST Tools</title>
</head>
<body fragment="webcom">
    <div fragment="webcom" webcom-fetch="GET:/test/components/HelloWorld.php" webcom-trigger="load"></div>
    <div fragment="fetcher" fetcher-fetch="GET:/test/components/HelloWorld.php" fetcher-trigger="load"></div>
    <div id="toggle-1">Hello</div>
    <button id="toggle-2" >Toggle</button>
    <button id="togler" fragment="toggle" toggle-target="#toggle-1.style.display=none|block,#toggle-2.disabled=true|remove">Toggle</button>
</body>
</html>