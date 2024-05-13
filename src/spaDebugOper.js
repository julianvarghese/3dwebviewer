// Add debug info in PropertyWindow
// Shift click face => add click coord + face attributes
//
function propChanged() {
    const el = document.getElementById('propertyContainer');
    let text = el.textContent
    let changed = text != '<no properties to display>'
    //console.log('propChanged: ' + changed + ' :  ' + text)
    return changed;
}

// ------------------------------------------------------------------
class spaDebugOper {
    constructor(viewer) {
        this._hwv = viewer;
    }

    propertyUpdated() {
        return new Promise(async (resolve) => {
            let count=6; // 2s
            while (count>0 && !propChanged()) {
                count--;
                await this.sleep(300)
            }
            resolve();
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onMouseDown(event) {
        let handled = false;
        switch (event.getButton()) {
            case Communicator.Button.Left:
                if (event.shiftDown()) {
                    handled = true;
                    this._hwv.selectionManager.clear();
                    //const pickConfig = new Communicator.PickConfig(Communicator.SelectionMask.Face | Communicator.SelectionMask.Line);
                    const pickConfig = new Communicator.PickConfig(Communicator.SelectionMask.All);
                    this._hwv.view.pickFromPoint(event.getPosition(), pickConfig).then(async (selection) => {

                        let container = document.getElementById('propertyContainer');

                        let xyzContent = '';

                        let nodeId = selection.getNodeId();
                        if (nodeId != null) {
                            var position = selection.getPosition();
                            console.log(position);

                            await this._hwv.selectionManager.set(selection);
                            xyzContent += '<table id="spaXYZTable" class="spaXYZ">';
                            xyzContent += '<tr class="headerRow">'
                            xyzContent += '<td>X</><td>Y</><td>Z</></tr>'
                            xyzContent += '<tr><td>' + position.x.toFixed(2) + '</><td>' + position.y.toFixed(2) + '</><td>' + position.z.toFixed(2) + '</></tr>'
                            xyzContent += '</table>'
                            
                            await this.propertyUpdated()
                            console.log('propertyUpdated done');
                        }
                        let isFaceSelected = selection.isFaceSelection();
                        let isEdgeSelected = selection.isLineSelection();
                        let content = '<table id="spaPropertyTable">';
                        content += '<tr class="headerRow">'
                        if (isFaceSelected)
                            content += '<td>Topo Face Att</>'
                        else if (isEdgeSelected)
                            content += '<td>Topo Edge Att</>'
                        else
                            content += '<td>Topo Other Att</>'
                        content += '<td>Value</td></tr>'
                        
                        if (isFaceSelected) {
                            let face = selection.getFaceEntity();
                            let faceIndex = face.getCadFaceIndex();
                            //this._hwv.model.getFaceAttributes(selection.getNodeId(), faceIndex).then((subAtts) => 
                            // using await here so content += are not scrambled
                            let subAtts = await this._hwv.model.getFaceAttributes(selection.getNodeId(), faceIndex)
                            if( subAtts != null ){
                                let atts = subAtts.attributes;
                                console.log(atts);
                                for (let att of atts) {
                                    let title = att.getTitle();
                                    let type = att.getType();
                                    let val = att.getValue();
                                    console.log("Att ", title, ": ", type, " = ", val)
                                    content += '<tr>'
                                    content += '<td>' + title + '</td>'
                                    content += '<td>' + val + '</td></tr>'
                                }
                            }//);
                        }
                        if (isEdgeSelected) {
                            let edge = selection.getLineEntity();
                            let edgeIndex = edge.getLineId();//? getCadEdgeIndex
                            //this._hwv.model.getFaceAttributes(selection.getNodeId(), edgeIndex).then((subAtts) => 
                            // using await here so content += are not scrambled
                            let subAtts = await this._hwv.model.getEdgeAttributes(selection.getNodeId(), edgeIndex)
                            if( subAtts != null ){
                                let atts = subAtts.attributes;
                                console.log(atts);
                                for (let att of atts) {
                                    let title = att.getTitle();
                                    let type = att.getType();
                                    let val = att.getValue();
                                    console.log("Att ", title, ": ", type, " = ", val)
                                    content += '<tr>'
                                    content += '<td>' + title + '</td>'
                                    content += '<td>' + val + '</td></tr>'
                                }
                            }//);
                        }
                        content += '</table>'

                        container.innerHTML += xyzContent
                        container.innerHTML += content
                    });
                }
                break;
            default:
                break
        }
        event.setHandled(handled);
    }

    onMouseUp(event) { }
    onMouseMove(event) { }
    onMousewheel(event) { }
    onTouchStart(event) { }
    onTouchMove(event) { }
    onTouchEnd(event) { }
    onKeyDown(event) { }
    onKeyUp(event) { }
    onDeactivate() { }
    onActivate() { }
    onViewOrientationChange() { }
    stopInteraction() { }
}