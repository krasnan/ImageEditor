# Collaborative ImageEditor extension for MediaWiki

This extension was developed as my Master thesis at Comenius University in Bratislava, Faculty of Mathematics, Physics and Informatics.
Extension provides collaborative capabilities to create and edit images in MediaWiki systems.

## Steps to run ImageEditor Server side
* Follow instructions described in ImageEditor Server repository [https://github.com/krasnan/ImageEditorServer.git](https://github.com/krasnan/ImageEditorServer.git)

## Steps to run ImageEditor extension in MediaWiki system

* copy content of this repository to `/extensions/ImageEditor/` directory in root of yours MediaWiki directory
* allow upload to your wiki `$wgEnableUploads = true;` in your `LocalSettings.php`
* add this lines to your  `LocalSettings.php` in root of MediaWiki directory 
where `$wgImageEditorServerSecret` is the secret word (hash) same with the server one, 
`$wgImageEditorServerHost` is your nodeJS server host 
and `$wgImageEditorServerPort` is your nodeJS server port.
```php
wfLoadExtension( 'ImageEditor' );
$wgImageEditorServerSecret = "SET API TOKEN";
$wgImageEditorServerHost = "http://wiki.example.com";
$wgImageEditorServerPort = 3000;
```
