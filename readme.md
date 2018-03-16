# Collaborative ImageEditor extension for MediaWiki

This extension was developed as my Master thesis at Comenius University in Bratislava, Faculty of Mathematics, Physics and Informatics.
Extension provides collaborative capabilities to create and edit images in MediaWiki systems.
## Steps to run server application:

* install dependencies `npm install`
* configure environment variables in `/server/package.json`, where `endpoint` is your MediaWiki `api.php` address
* if you want to set endpoint dynamicly from client side, set property `dynamic_endpoint` to `"true"`

```json
  "config": {
    "port": "3000",
    "host": "localhost",
    "endpoint": "http://wiki.example.com/api.php",
    "dynamic_endpoint": "false"
  }
```

* run node server application with command `npm start`


## Steps to run ImageEditor extension in MediaWiki system

* copy content of this repository to `/extensions/ImageEditor/` directory in root of yours MediaWiki directory
* allow upload to your wiki `$wgEnableUploads = true;` in your `LocalSettings.php`
* add this lines to your  `LocalSettings.php` in root of MediaWiki directory where  `$wgImageEditorServerHost` is your nodeJS server host and `$wgImageEditorServerPort` is your nodeJS server port.

```php
wfLoadExtension( 'ImageEditor' );
$wgImageEditorServerHost = "http://wiki.example.com";
$wgImageEditorServerPort = 3000;
```
