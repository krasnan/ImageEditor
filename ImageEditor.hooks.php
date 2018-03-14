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
        if( $file->getDescription()[0] != '{') return false;
        $meta = $file;
        $dbw = $file->repo->getMasterDB();
        $meta = unserialize($file->getMetadata());
        $meta["imageEditorContent"] = $file->getDescription();

        $dbw->update('image',
            ['img_metadata' => serialize($meta)],
            ['img_name' => $file->getName()],
            __METHOD__);
        return true;
    }

    public static function onSkinTemplateNavigation(&$skinTemplate, &$content_navigation ){
        global $wgScript;
        $title = $skinTemplate->getRelevantTitle();

        if($title->getNamespace() != 6) return;

        $user = $skinTemplate->getUser();
        $file = $skinTemplate->getContext()->getWikiPage()->getFile();
        $mime = $file->getMimeType();
        $mime_major = explode('/', $mime)[0]; //image
        $mime_minor = explode('/', $mime)[1]; //png/jpeg/....

        if ( $title->quickUserCan( 'edit', $user )
            && ( $title->exists() || $title->quickUserCan( 'create', $user ))
            && $mime_major == 'image'
            && in_array($mime_minor, ['png', 'jpeg', 'jpg', 'gif', 'tiff'])
        ) {
            $content_navigation['views']['edit-image'] = [
                'class' => '',
                'text' => $skinTemplate->getContext()->msg('open-image-editor'),
                'href' => $wgScript .'?title=Special:ImageEditor&file='.$skinTemplate->thispage,
                'primary' => true, // don't collapse this in vector
            ];
        }
    }
}
