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
        $user = $this->getUser();
        $rights = $user->getRights();
        global $wgGroupPermissions, $wgRevokePermissions;

        $out = $this->getOutput();


        if(!$this->getUser()->isAllowed('edit')){
            $out->showPermissionsErrorPage([['badaccess-group0']], 'edit');
        }
        else{
            $template = new ImageEditorTemplate();
            $template->setRef("context", $this);
            $out->addModules(["ext.imageEditor"]);
            $out->addTemplate($template);
        }
    }
    function getGroupName() {
        return 'media';
    }
}
