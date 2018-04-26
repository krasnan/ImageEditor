<?php
/**
 * Hooks for BoilerPlate extension
 *
 * @file
 * @ingroup Extensions
 */

class ImageEditorHooks
{
    /**
     * Add JSON format of Image Editor export to metadata
     * @param LocalFile $file
     * @return bool
     */
    public static function onFileUpload($file, $reupload, $newPageContent)
    {
        if(!isset($_POST['imageeditor'])) return false;

        $dbw = $file->repo->getMasterDB();
        $meta = unserialize($file->getMetadata());

        $meta["imageEditorContent"] = $_POST['imageeditor'];

        $dbw->update('image',
            ['img_metadata' => serialize($meta)],
            ['img_name' => $file->getName()],
            __METHOD__);
        return true;
    }

    public static function onSkinTemplateNavigation_SpecialPage( &$skinTemplate, array &$content_navigation ) {
        global $wgScript;

        if(!isset($_GET['wpDestFile'])) return;

        $content_navigation['views']['edit-image'] = [
            'class' => '',
            'text' => $skinTemplate->getContext()->msg('ie-create-with-image-editor'),
            'href' => $wgScript . '?title=Special:ImageEditor&file=' . "File:" . $_GET['wpDestFile'] . "&returnto=File:" . $_GET['wpDestFile'],
            'primary' => true, // don't collapse this in vector
        ];
    }

    public static function onSkinTemplateNavigation(&$skinTemplate, &$content_navigation)
    {
        global $wgScript;
        $title = $skinTemplate->getRelevantTitle();

        if ($title->getNamespace() != 6) return;

        $user = $skinTemplate->getUser();
        $file = $skinTemplate->getContext()->getWikiPage()->getFile();

        if ($file->exists()) {
            $mime = $file->getMimeType();
            $mime_major = explode('/', $mime)[0]; //image
            $mime_minor = explode('/', $mime)[1]; //png/jpeg/....
            if ($title->quickUserCan('edit', $user)
                && $mime_major == 'image'
                && in_array($mime_minor, ['png', 'jpeg', 'jpg', 'gif', 'tiff'])
            ) {
                $content_navigation['views']['edit-image'] = [
                    'class' => '',
                    'text' => $skinTemplate->getContext()->msg('ie-open-image-editor'),
                    'href' => $wgScript . '?title=Special:ImageEditor&file=' . $skinTemplate->thispage . "&returnto=" . $title->getPrefixedURL(),
                    'primary' => true, // don't collapse this in vector
                ];
            }
        } else if ($title->quickUserCan('create', $user)
            && $title->quickUserCan('upload', $user)) {
            $content_navigation['views']['edit-image'] = [
                'class' => '',
                'text' => $skinTemplate->getContext()->msg('ie-create-with-image-editor'),
                'href' => $wgScript . '?title=Special:ImageEditor&file=' . $skinTemplate->thispage . "&returnto=" . $title->getPrefixedURL(),
                'primary' => true, // don't collapse this in vector
            ];
        }
    }

    public static function onResourceLoaderGetConfigVars(array &$vars)
    {
        global $wgImageEditorServerPort, $wgImageEditorServerHost, $wgImageEditorServerSecret;

        $vars['wgImageEditor'] = [
            'secret' => md5($wgImageEditorServerSecret),
            'port' => $wgImageEditorServerPort,
            'host' => $wgImageEditorServerHost
        ];

        return true;
    }
}
