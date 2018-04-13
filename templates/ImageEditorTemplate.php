<?php
/**
 * @file
 */
if ( !defined( 'MEDIAWIKI' ) ) {
    die( -1 );
}

/**
 * HTML template for Special:MySpecialPage
 * @ingroup Templates
 */
class ImageEditorTemplate extends QuickTemplate {
    /**
     * Main processing is done here.
     *
     * For proper i18n, use $this->getMsg( 'message-key' ) with the appropriate
     * parameters (see [[Manual:Messages API]] on MediaWiki.org for further
     * details).
     * Because this is just an example, we're using hard-coded English text
     * here. In your production-grade code, you obviously should be using the
     * proper internationalization functions instead.
     */
    public function execute() {
        ?>
        <div class="ie" ng-controller="ImageEditor" ng-class="{ie__loaded : room.loaded, ie__fullscreen : isFullscreen}" >
            <div class="ie__container" style="visibility: hidden;">
                <div class="ie__playground" ng-click="onPlaygroundClick($event);">
                    <div class="ie__playground__container">
                        <canvas id="ie__canvas" width="800" height="600"></canvas>
                        <div class="ie__user__bubble">asdf</div>
                    </div>
                </div>

                <div class="ie__info">
                    <div class="ie__panel__horizontal">
                        <!--                    <input class="input" type="text" placeholder="Image Name...">-->
                        <div class="ie__dropdown">
                            <a title="" class="btn ie__dropdown__btn" ng-click=""><?= $this->msg('ie-file') ?></a>
                            <div class="ie__dropdown__list">
                                <a title="" class="btn" ng-click="rasterize($event,'export.png')"><?= $this->msg('ie-export-as') ?> PNG</a>
                                <a title="" class="btn" ng-click="rasterizeSVG($event,'export.svg')"><?= $this->msg('ie-export-as') ?> SVG</a>

                                <a title="" class="btn" ng-click="saveRevision()"><?= $this->msg('ie-save') ?></a>
                                <a title="" class="btn" ng-click="closeEditor()"><?= $this->msg('ie-close') ?></a>
                            </div>
                        </div>
                        <div class="ie__dropdown">
                            <a title="" class="btn ie__dropdown__btn" ng-click=""><?= $this->msg('ie-edit') ?></a>
                            <div class="ie__dropdown__list">
                                <a title="" class="btn" ng-click="cut()"><?= $this->msg('ie-cut') ?><span>ctrl + x</span></a>
                                <a title="" class="btn" ng-click="copy()"><?= $this->msg('ie-copy') ?><span>ctrl + c</span></a>
                                <a title="" class="btn" ng-click="paste()"><?= $this->msg('ie-paste') ?><span>ctrl + v</span></a>
                                <a title="" class="btn" ng-click="duplicate()"><?= $this->msg('ie-duplicate') ?><span>shift + v</span></a>
                                <a title="" class="btn" ng-click="deleteSelection()"><?= $this->msg('ie-delete') ?><span>del</span></a>
                            </div>
                        </div>
                        <div class="ie__dropdown">
                            <a title="" class="btn ie__dropdown__btn" ng-click=""><?= $this->msg('ie-object') ?></a>
                            <div class="ie__dropdown__list">
                                <a title="" class="btn" ng-click="bringToFront()"><?= $this->msg('ie-bring-to-front') ?> <span>ctrl + shift + ↑</span></a>
                                <a title="" class="btn" ng-click="bringForward()"><?= $this->msg('ie-bring-forward') ?> <span>ctrl + ↑</span></a>
                                <a title="" class="btn" ng-click="sendBackwards()"><?= $this->msg('ie-send-backward') ?> <span>ctrl + ↓</span></a>
                                <a title="" class="btn" ng-click="sendToBack()"><?= $this->msg('ie-send-to-back') ?> <span>ctrl + shift + ↓</span></a>

                            </div>
                        </div>

                        <div class="ie__dropdown ie__collaborators">
                            <a title="" class="btn ie__dropdown__btn" ng-click=""><i class="icon-users"></i></a>
                            <div class="ie__dropdown__list">
                                <a ng-repeat="user in room.users" title="{[user.name]}" style="color: {[user.color]};" class="btn"><i class="icon-user-circle-o"></i> {[user.name]}</a>
                            </div>
                        </div>

                        <a title="<?= $this->msg('ie-toggle-fullscreen') ?>" ng-click="toggleFullScreen()" class="btn" ><i ng-class="isFullscreen ? 'icon-shrink' : 'icon-enlarge'"></i></a>
                        <a title="<?= $this->msg('ie-center-viewport') ?>" ng-click="centerViewport()" class="btn" ><i class="icon-target"></i></a>
                        <a title="<?= $this->msg('ie-toggle-messenger') ?>" ng-click="scrollDown('ie__messenger__messages'); messengerVisible = !messengerVisible; room.newMessage = false" class="btn" ng-class="room.newMessage && !messengerVisible ? 'text-danger' : ''"><i class="icon-bubbles2"></i></a>
                        <div class="ie__messenger" ng-class="messengerVisible==true ? 'active' : ''">
                            <div class="ie__messenger__messages">
                                <div ng-repeat="message in room.messages" class="ie__messenger__item" ng-class="message.type=='system' ? 'system_message' : ''">
                                    <div ng-show="message.type === 'system'" class="ie__messenger__item__head">{[message.time]} | {[message.text]}</div>
                                    <div ng-show="message.type !== 'system'" class="ie__messenger__item__head">{[message.time]} | {[message.from]}</div>
                                    <span ng-show="message.type !== 'system'" class="ie__messenger__item__content">{[message.text]}</span>
                                </div>
                            </div>
                            <div class="ie__messenger__controll">
                                <input type="text" ng-model="message" on-enter="sendMessage(message)" placeholder="<?= $this->msg('ie-message') ?>">
                                <a title="<?= $this->msg('ie-send') ?>" class="btn" ng-click="sendMessage(message)"><i class="icon-send active"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ie__tools">
                    <div class="ie__panel__vertical">
                        <a title="<?= $this->msg('ie-select-tool') ?>" ng-class="activeTool == tools.select ? 'active' : '' " ng-click="setActiveTool(tools.select)" class="btn"><i class="icon-select"></i></a>
                        <a title="<?= $this->msg('ie-brush-tool') ?>" ng-class="activeTool == tools.brush ? 'active' : '' " ng-click="setActiveTool(tools.brush)" class="btn"><i class="icon-pencil2"></i></a>
                        <a title="<?= $this->msg('ie-image-tool') ?>" ng-click="panels.file_upload.opened = true" class="btn"><i class="icon-image"></i></a>
                        <a title="<?= $this->msg('ie-Line-tool') ?>" ng-class="activeTool == tools.line ? 'active' : '' " ng-click="setActiveTool(tools.line)" class="btn"><big><b>\</b></big></a>
                        <a title="<?= $this->msg('ie-Rectangle-tool') ?>" ng-class="activeTool == tools.rectangle ? 'active' : '' " ng-click="setActiveTool(tools.rectangle)" class="btn"><i class="icon-square" ng-click="addRect()"></i></a>
                        <a title="<?= $this->msg('ie-ellipse-tool') ?>" ng-class="activeTool == tools.ellipse ? 'active' : '' " ng-click="setActiveTool(tools.ellipse)" class="btn"><i class="icon-oval"></i></a>
                        <a title="<?= $this->msg('ie-triangle-tool') ?>" ng-class="activeTool == tools.triangle ? 'active' : '' " ng-click="setActiveTool(tools.triangle)" class="btn"><i class="icon-triangle"></i></a>
                        <a title="<?= $this->msg('ie-polygon-tool') ?>" ng-class="activeTool == tools.polygon ? 'active' : '' " ng-click="setActiveTool(tools.polygon)" class="btn"><i class="icon-polygon"></i></a>
                        <a title="<?= $this->msg('ie-textbox-tool') ?>" ng-class="activeTool == tools.text ? 'active' : '' " ng-click="setActiveTool(tools.text)" class="btn"><bib><b>T</b></bib></a>
                        <a title="<?= $this->msg('ie-snap-to-grid') ?>" ng-class="snapToGrid ? 'active' : '' " ng-click="snapToGrid = !snapToGrid" class="btn"><big>▦</big></a>
                        <div class="ie__container__picker btn">
                            <div title="<?= $this->msg('ie-background-color') ?>" colorpicker="rgba" colorpicker-position="right" colorpicker-with-input="true" ng-model="fillColor" ng-change="setFillColor(fillColor)" class="ie__container__picker__background" style="background-color:{[getFillColor()]}"></div>
                            <div title="<?= $this->msg('ie-stroke-color') ?>" colorpicker="rgba" colorpicker-position="right" colorpicker-with-input="true" ng-model="strokeColor" ng-change="setStrokeColor(strokeColor)" class="ie__container__picker__stroke" style="background-color:{[getStrokeColor();]}">
                                <div class="ie__container__picker__stroke__inner"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ie__options">

                    <div class="ie__panel__vertical" ng-class="panels.layers.opened === true ? 'opened' : '' ">
                        <div class="ie__options__header"><?= $this->msg('ie-layers') ?> <a title="<?= $this->msg('ie-toggle-panel') ?>" class="ie__options__toggle" ng-click="panels.layers.opened = !panels.layers.opened"><i class="icon-circle-up"></i></a></div>
                        <div sv-root sv-part="canvas._objects"  sv-on-sort="reorderLayer($item, $indexTo)" class="ie__options__body">

                            <div ng-repeat="layer in canvas._objects" sv-element class="ie__tile__14 ie__layer"  ng-class="layer.selectable ? '' : 'disabled' " style="{[(room.users[layer.selectedBy] !== undefined ? 'border:' + room.users[layer.selectedBy].color + '1px solid' : '' )">
                                <div>
                                    <a title="<?= $this->msg('ie-select-layer') ?>" ng-click="selectObject(layer)" class="pull-left"><i ng-class="layer.isSelected() ? 'icon-radio-checked' : 'icon-radio-unchecked'"></i></a>
                                    <input title="{[layer.name]}" type="text" ng-model="layer.name" ng-change="applyChanges(layer)" ng-model-options="{updateOn: 'blur'}">
                                    <a title="<?= $this->msg('ie-reorder-layer') ?>" sv-handle class="ie__layer__reorder pull-right">☰</a>
                                    <a title="<?= $this->msg('ie-delete-layer') ?>" ng-click="deleteObject(layer)" class="pull-right"><i class="icon-trash"></i></a>
                                    <a title="<?= $this->msg('ie-toggle-layer-visibility') ?>" ng-click="toggleVisibility(layer)" class="pull-right"><i ng-class="layer.visible ? 'icon-eye': 'icon-eye-blocked'"></i></a>
                                    <a title="<?= $this->msg('ie-toggle-layer-lock') ?>" ng-click="toggleLock(layer)" class="pull-right"><i ng-class="!layer.lockMovementX && !layer.lockMovementY && !layer.lockScalingX && !layer.lockScalingY && !layer.lockUniScaling && !layer.lockRotation  ? 'icon-unlocked': 'icon-lock'"></i></a>
                                </div>

                            </div>

<!--                            <div class="ie__tile__11">-->
<!--                                <a title="Group selected objects" ng-class="canvas.getActiveObject().type === 'activeSelection' ? 'text-primary' : 'disabled' " ng-click="groupSelection();" ><i class="icon-group"></i></a>-->
<!--                            </div>-->
<!--                            <div class="ie__tile__11">-->
<!--                                <a title="Ungroup selected objects" ng-class="canvas.getActiveObject().type === 'group' ? 'text-primary' : 'disabled' " ng-click="ungroupSelection();" ><i class="icon-ungroup"></i></a>-->
<!--                            </div>-->
                            <div class="ie__tile__11">
                                <a title="<?= $this->msg('ie-select-all') ?>" ng-class="canvas.getObjects().length>0 ? 'text-primary' : 'disabled' "  ng-click="selectAllObjects();"><i class="icon-checkbox-checked"></i></a>
                            </div>
                            <div class="ie__tile__11">
                                <a title="<?= $this->msg('ie-deselect-all') ?>" ng-class="canvas.getActiveObjects().length>0 ? 'text-primary' : 'disabled' " ng-click="canvas.discardActiveObject();" ><i class="icon-checkbox-unchecked"></i></a>
                            </div>

                        </div>

                    </div>

                    <div class="ie__panel__vertical" ng-class="panels.properties.opened === true ? 'opened' : '' ">
                        <div class="ie__options__header"><?= $this->msg('ie-options') ?> <a title="<?= $this->msg('ie-toggle-panel') ?>" class="ie__options__toggle" ng-click="panels.properties.opened = !panels.properties.opened"><i class="icon-circle-up"></i></a></div>
                        <div class="ie__options__body">

                            <div>
                                <div class="ie__tile__24">
                                    <label>
                                        <?= $this->msg('ie-zoom') ?>
                                        <input type="number" ng-model="canvasZoom" ng-change="updateCanvasZoom()" min="1" max="300" step="0.1">%
                                    </label>
                                    <input title="" type="range" ng-model="canvasZoom" ng-change="updateCanvasZoom()" min="1" max="300" step="0.1">
                                </div>
                            </div>

                            <!-- brush properties-->
                            <div class="ie__options__stroke" ng-show="canvas.isDrawingMode">
                                <div class="ie__options__title"><?= $this->msg('ie-brush') ?></div>

                                <div class="ie__tile__11">
                                    <a ng-init="brushType='Pencil'" ng-click="setFreeDrawingBrush('Pencil')" ng-class="brushType === 'Pencil' ? 'active' : ''"><i class="icon-pencil"></i></a>
                                </div>
                                <div class="ie__tile__11">
                                    <a ng-click="setFreeDrawingBrush('Spray')" ng-class="brushType === 'Spray' ? 'active' : ''"><i class="icon-spray"></i></a>
                                </div>
                                <div class="ie__tile__11">
                                    <a ng-click="setFreeDrawingBrush('Circle')" ng-class="brushType === 'Circle' ? 'active' : ''"><i class="icon-oval"></i></a>
                                </div>

                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-brush-size') ?></label>
                                    <input title="" type="number" min="1" step="1" ng-model="canvas.freeDrawingBrush.width">
                                </div>
                                <div class="ie__options__title"><?= $this->msg('ie-shadow') ?></div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-blur') ?></label>
                                    <input title="" type="number" min="0" step="1" ng-model="canvas.freeDrawingBrush.shadow.blur">
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-color') ?></label>
                                    <div title="" colorpicker="rgba" colorpicker-position="left" colorpicker-with-input="true" ng-model="canvas.freeDrawingBrush.shadow.color" class="ie__colorpicker" style="background-color:{[canvas.freeDrawingBrush.shadow.color]}"></div>

                                </div>
                            </div>

                            <!-- canvas properties-->
                            <div class="ie__options__canvas" ng-show="canvas.getActiveObject() == undefined">
                                <div class="ie__options__title"><?= $this->msg('ie-canvas') ?> </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-width') ?></label>
                                    <input title="" type="number" ng-model="canvasWidth" ng-change="updateCanvasWidth()">
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-height') ?></label>
                                    <input title="" type="number" ng-model="canvasHeight" ng-change="updateCanvasHeight()">
                                </div>

                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-background-color') ?></label>
                                    <div title="" colorpicker="rgba" colorpicker-position="left" colorpicker-with-input="true" ng-model="canvasBgColor" ng-change="setCanvasBgColor(canvasBgColor)" class="ie__colorpicker" style="background-color:{[getCanvasBgColor()]}"></div>

                                </div>
                            </div>

                            <!-- object default properties-->
                            <div class="ie__options__object" ng-show="canvas.getActiveObject() != undefined">

                                <div class="ie__options__title">{[canvas.getActiveObject().get('type')]}</div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-x-coords') ?></label>
                                    <input type="number" bind-value-to="left">
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-y-coords') ?></label>
                                    <input type="number" bind-value-to="top">
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-height') ?></label>
                                    <input type="number" bind-value-to="height">
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-width') ?></label>
                                    <input type="number" bind-value-to="width">
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-angle') ?></label>
                                    <input type="number" bind-value-to="angle" min="-360" max="360">
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-opacity') ?></label>
                                    <input type="number" bind-value-to="opacity" min="0" max="100">
                                </div>
                                <div ng-show="canvas.getActiveObject().type === 'rect'">
                                    <div class="ie__options__title"><?= $this->msg('ie-border-roundness') ?></div>

                                    <div class="ie__tile__22">
                                        <label>rx</label>
                                        <input type="number" bind-value-to="rx" min="0">
                                    </div>
                                    <div class="ie__tile__22">
                                        <label>ry</label>
                                        <input type="number" bind-value-to="ry" min="0">
                                    </div>
                                </div>


                                <div class="ie__options__title"><?= $this->msg('ie-reference-point') ?></div>
                                <div class="ie__options__reference">
                                    <svg version="1.1" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" overflow="scroll" xml:space="preserve">
                                        <rect ng-click="setOriginX('left');setOriginY('top')" ng-class="getOriginX() == 'left' && getOriginY() == 'top'  ? 'active' : ''" y="0"  width="8" height="8"/>
                                        <rect ng-click="setOriginX('center');setOriginY('top')" ng-class="getOriginX() == 'center' && getOriginY() == 'top'  ? 'active' : ''" x="12" y="0"  width="8" height="8"/>
                                        <rect ng-click="setOriginX('right');setOriginY('top')" ng-class="getOriginX() == 'right' && getOriginY() == 'top'  ? 'active' : ''" x="24" y="0"  width="8" height="8"/>
                                        <rect ng-click="setOriginX('left');setOriginY('center')" ng-class="getOriginX() == 'left' && getOriginY() == 'center'  ? 'active' : ''"   y="12" width="8" height="8"/>
                                        <rect ng-click="setOriginX('center');setOriginY('center')" ng-class="getOriginX() == 'center' && getOriginY() == 'center'  ? 'active' : ''"   x="12" y="12" width="8" height="8"/>
                                        <rect ng-click="setOriginX('right');setOriginY('center')" ng-class="getOriginX() == 'right' && getOriginY() == 'center'  ? 'active' : ''"   x="24" y="12"  width="8" height="8"/>
                                        <rect ng-click="setOriginX('left');setOriginY('bottom')" ng-class="getOriginX() == 'left' && getOriginY() == 'bottom'  ? 'active' : ''"   y="24" width="8" height="8"/>
                                        <rect ng-click="setOriginX('center');setOriginY('bottom')" ng-class="getOriginX() == 'center' && getOriginY() == 'bottom'  ? 'active' : ''"   x="12" y="24"  width="8" height="8"/>
                                        <rect ng-click="setOriginX('right');setOriginY('bottom')" ng-class="getOriginX() == 'right' && getOriginY() == 'bottom'  ? 'active' : ''"   x="24" y="24"  width="8" height="8"/>
                                    </svg>
                                </div>
                                <div ng-show="canvas.getActiveObjects().length > 1">
                                    <div class="ie__options__title"><?= $this->msg('ie-align-objects') ?></div>
                                    <div class="ie__options__align">
                                        <div class="ie__tile__11">
                                            <a ng-click="groupAlign('horizontal-left')"><i class="icon-horizontal-align-left"></i></a>
                                        </div>
                                        <div class="ie__tile__11">
                                            <a ng-click="groupAlign('horizontal-center')"><i class="icon-horizontal-align-center"></i></a>
                                        </div>
                                        <div class="ie__tile__11">
                                            <a ng-click="groupAlign('horizontal-right')"><i class="icon-horizontal-align-right"></i></a>
                                        </div>

                                        <div class="ie__tile__11">
                                            <a ng-click="groupAlign('vertical-top')"><i class="icon-vertical-align-top"></i></a>
                                        </div>
                                        <div class="ie__tile__11">
                                            <a ng-click="groupAlign('vertical-center')"><i class="icon-vertical-align-center"></i></a>
                                        </div>
                                        <div class="ie__tile__11">
                                            <a ng-click="groupAlign('vertical-bottom')"><i class="icon-vertical-align-bottom"></i></a>
                                        </div>
                                    </div>
                                </div>

                            </div>


                            <!-- stroke properties-->
                            <div class="ie__options__stroke" ng-show="canvas.getActiveObject() != undefined">
                                <div class="ie__options__title"><?= $this->msg('ie-stroke') ?></div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-width') ?></label>
                                    <input title="" type="number" bind-value-to="strokeWidth" min="0">
                                </div>
                            </div>

                        </div>
                    </div>


                    <div class="ie__panel__vertical" ng-class="panels.font.opened === true ? 'opened' : '' " ng-show="canvas.getActiveObject().get('type') == 'textbox'">
                        <div class="ie__options__text">
                            <div class="ie__options__header"><?= $this->msg('ie-font') ?> <a title="<?= $this->msg('ie-toggle-panel') ?>" class="ie__options__toggle" ng-click="panels.font.opened = !panels.font.opened"><i class="icon-circle-up"></i></a></div>
                            <div class="ie__options__body">

                                <div class="ie__tile__24">
                                    <label><?= $this->msg('ie-font') ?> </label>
                                    <select title="" bind-value-to="fontFamily">
                                        <option value="arial">Arial</option>
                                        <option value="helvetica" selected="">Helvetica</option>
                                        <option value="myriad pro">Myriad Pro</option>
                                        <option value="delicious">Delicious</option>
                                        <option value="verdana">Verdana</option>
                                        <option value="georgia">Georgia</option>
                                        <option value="courier">Courier</option>
                                        <option value="comic sans ms">Comic Sans MS</option>
                                        <option value="impact">Impact</option>
                                        <option value="monaco">Monaco</option>
                                        <option value="optima">Optima</option>
                                        <option value="hoefler text">Hoefler Text</option>
                                        <option value="plaster">Plaster</option>
                                        <option value="engagement">Engagement</option>
                                    </select>

                                </div>
                                <div class="ie__tile__11">
                                    <a title="<?= $this->msg('ie-bold') ?>" ng-click="toggleBold()" ng-class="isBold() == true ? 'active' : ''" ><i class="icon-bold"></i></a>
                                </div>
                                <div class="ie__tile__11">
                                    <a title="<?= $this->msg('ie-italic') ?>" ng-click="toggleItalic()" ng-class="isItalic() == true ? 'active' : ''" ><i class="icon-italic"></i></a>
                                </div>
                                <div class="ie__tile__11">
                                    <a title="<?= $this->msg('ie-underline') ?>" ng-click="toggleUnderline()" ng-class="isUnderline() == true ? 'active' : ''" ><i class="icon-underline"></i></a>
                                </div>
                                <div class="ie__tile__11">
                                    <a title="<?= $this->msg('ie-line-through') ?>" ng-click="toggleLinethrough()" ng-class="isLinethrough() == true ? 'active' : ''" ><i class="icon-strikethrough"></i></a>
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-line-height') ?></label>
                                    <input title="" type="number" bind-value-to="lineHeight" min="0" step="0.1">
                                </div>
                                <div class="ie__tile__22">
                                    <label><?= $this->msg('ie-font-size') ?></label>
                                    <input title="" type="number" bind-value-to="fontSize" min="0">
                                </div>
                            </div>
                        </div>

                    </div>


                    <div class="ie__panel__vertical" ng-class="panels.image.opened === true ? 'opened' : '' " ng-show="canvas.getActiveObject().get('type') === 'image' && false">
                        <div class="ie__options__text">
                            <div class="ie__options__header"><?= $this->msg('ie-image') ?> <a title="<?= $this->msg('ie-toggle-panel') ?>"  class="ie__options__toggle" ng-click="panels.image.opened = !panels.image.opened"><i class="icon-circle-up"></i></a></div>
                            <div class="ie__options__body">

                                <div class="ie__tile__24">
                                    <label>
<!--                                        <input type="checkbox" ng-checked="canvas.getActiveObject().filters[0] === false" ng-click="addFilter(canvas.getActiveObject(), 0, this.checked && 'contrast')">-->
                                        <?= $this->msg('ie-contrast') ?>
<!--                                        <input type="text" ng-model="canvas.getActiveObject().filters[0]['contrast']" >-->
                                    </label>
<!--                                    <input title="" type="range" ng-model="canvas.getActiveObject().filters[0]['contrast']" ng-change="" min="-1" max="1" step="0.001">-->
<!--                                    canvas.getActiveObject().applyFilters(canvas.renderAll.bind(canvas));-->
                                </div>

                            </div>
                        </div>
                    </div>


                </div>

                <div class="ie__modal" ng-show="panels.file_upload.opened === true">
                    <div class="ie__modal__container">
                        <div class="ie__modal__header"><?= $this->msg('ie-upload-image') ?> <a class="btn" ng-click="panels.file_upload.opened = false"><i class="icon-circle-cancel"></i></a></div>
                        <div class="ie__modal__body">
                            <input class="hidden" files-input ng-model="new_file"  id="file_upload" type="file" accept=".jpg, .png, .jpeg, .svg">
                            <label class="btn-white" for="file_upload"><i class="icon-upload"></i> {[ new_file.name ? new_file.name : '<?= $this->msg('ie-select-image') ?>'  ]}</label>
                        </div>
                        <div class="ie__modal__footer">
<!--                            <div class="btn btn-danger" ng-click="panels.file_upload.opened = false">Cancel</div>-->
                            <div class="btn-primary" ng-click="panels.file_upload.opened = false; loadImage(new_file);"><?= $this->msg('ie-insert') ?></div>
                        </div>
                    </div>
                </div>

                <div class="ie__modal" ng-show="panels.modal.opened === true">
                    <div class="ie__modal__container">
                        <div class="ie__modal__header">{[panels.modal.header]}<a class="btn" ng-click="panels.modal.opened = false"><i class="icon-circle-cancel"></i></a></div>
                        <div class="ie__modal__body">
                            {[panels.modal.text]}
                        </div>
                        <div class="ie__modal__footer">
                            <a class="btn-danger" ng-show="panels.modal.cancelText != undefined" ng-click="panels.modal.cancel();panels.modal.opened = false">{[panels.modal.cancelText]}</a>
                            <a class="btn-primary" ng-show="panels.modal.optionalText != undefined" ng-click="panels.modal.optional();panels.modal.opened = false">{[panels.modal.optionalText]}</a>
                            <a class="btn-primary" ng-show="panels.modal.successText != undefined" ng-click="panels.modal.success();panels.modal.opened = false">{[panels.modal.successText]}</a>
                        </div>
                    </div>
                </div>

            </div>

            <div class="ie__preloader">
                <div class="ie__preloader__container">
                    <div class="ie__preloader__body">
                        <i class="icon-spinner8"></i>
                        <p><?= $this->msg('ie-loading') ?></p>
                        <p><small>{[loadingMessage]}</small></p>
                        <small><a class="link" ng-click="room.loaded = true"><?= $this->msg('ie-close') ?></a></small>
                    </div>
                </div>
            </div>



        </div>
        <?php
    }

} // class