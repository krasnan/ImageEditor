<?php
/**
 * HelloWorld SpecialPage for BoilerPlate extension
 *
 * @file
 * @ingroup Extensions
 */

class SpecialImageEditor extends SpecialPage {
	public function __construct() {
		parent::__construct( 'ImageEditor' );
	}

	/**
	 * Show the page to the user
	 *
	 * @param string $sub The subpage string argument (if any).
	 *  [[Special:HelloWorld/subpage]].
	 */
	public function execute( $sub ) {
        $template = new ImageEditorTemplate();
        $out = $this->getOutput();


        $template->setRef("context", $this);

        $out->addModules(["font-awesome","ext.imageEditor"]);
        $out->addTemplate($template);
    }
    function getGroupName() {
        return 'media';
    }
}
