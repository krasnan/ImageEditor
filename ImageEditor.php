<?php

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'ImageEditor' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['ImageEditor'] = __DIR__ . '/i18n';
	$wgExtensionMessagesFiles['ImageEditorAlias'] = __DIR__ . '/ImageEditor.i18n.alias.php';
	wfWarn(
		'Deprecated PHP entry point used for BoilerPlate extension. Please use wfLoadExtension ' .
		'instead, see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
	return true;
} else {
	die( 'This version of the ImageEditor extension requires MediaWiki 1.25+' );
}
