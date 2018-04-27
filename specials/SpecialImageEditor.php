<?php
/**
 * HelloWorld SpecialPage for BoilerPlate extension
 *
 * @file
 * @ingroup Extensions
 */

class SpecialImageEditor extends SpecialPage
{
    public function __construct()
    {
        parent::__construct('ImageEditor');
    }

    /**
     * Show the page to the user
     *
     * @param string $sub The subpage string argument (if any).
     *  [[Special:HelloWorld/subpage]].
     */
    public function execute($sub)
    {
        $user = $this->getUser();
        $rights = $user->getRights();
        global $wgGroupPermissions, $wgRevokePermissions;

        $out = $this->getOutput();


        if (!$this->getUser()->isAllowed('edit')) {
            $out->showPermissionsErrorPage([['badaccess-group0']], 'edit');
        } else if ( !isset($_GET["file"])) {
            $this->renderFileNameForm();
        } else {
            $template = new ImageEditorTemplate();
            $template->setRef("context", $this);
            $out->addModules(["ext.imageEditor"]);
            $out->addTemplate($template);
        }
    }

    function getGroupName()
    {
        return 'media';
    }

    private function renderFileNameForm()
    {
        $this->getOutput()->setPageTitle($this->msg('ie-create-image'));
        $this->getOutput()->addWikiText($this->msg('ie-create-image-description'));

        $formDescriptor = [
            'file' => [
                'placeholder' => 'ExampleName',
                'maxlength' => 100,
                'required' => true,
                'vertical-label'=>true,
                'class' => 'HTMLTextField',
                'label' => $this->msg('ie-insert-image-name')
            ]
        ];
        $htmlForm = new HTMLForm($formDescriptor, $this->getContext(), 'testform');

        $htmlForm->setSubmitText($this->msg('ie-create-with-image-editor'));
        $htmlForm->setSubmitCallback([$this, 'checkFileName']);

        $htmlForm->show();
    }

    public function checkFileName($formData)
    {
        global $wgScript, $wgMessage;
        preg_match('/^[a-zá-žA-ZÁ-Ž0-9_]{1,100}$/', $formData["file"], $matches, PREG_OFFSET_CAPTURE);

        if(count($matches) === 0)
            return $this->msg('ie-invalid-image-name');
        $file = "File:". ucfirst($formData["file"]).".png";
        $this->getOutput()->redirect($wgScript . '?title=Special:ImageEditor&file=' . $file . "&returnto=" . $file);
        return true;
    }
}
