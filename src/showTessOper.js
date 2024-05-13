// Creates mesh for a body tessellation 
// Left click+ Alt => Add tess mesh
// Left click+ Alt => switch tess visibility
// Middle click    => switch body visibility
// Esc => Restore visibility
//
class ShowTessOper {
    constructor(viewer) {
        this._viewer = viewer;
        this._partId = null;
        this._tessNodeId = null;
        this._isGenerated = new Map();
    }

    onMouseDown(event) {
        let button = event.getButton()
        if(button === Communicator.Button.Right) 
            return // leave right button unchanged so context menu still works

        let handled=false;

        const pickConfig = new Communicator.PickConfig(Communicator.SelectionMask.All);
        this._viewer.view.pickFromPoint(event.getPosition(), pickConfig).then( async (selection) => {
            if (selection.getSelectionType() !== Communicator.SelectionType.None) {
                switch (button) {
                    case Communicator.Button.Left:
                        if (event.altDown()) {
                            this._partId = selection.getNodeId();

                            // generate tess mesh if not available
                            // Switch tess visibiity otherwise
                            this._tessNodeId = this._isGenerated.get(this._partId);
                            console.log('PartId: '+this._partId+ ' TessId: '+this._tessNodeId)
                            if (this._tessNodeId == undefined || this._tessNodeId == null) {
                                await this._generateTessfromFaces(this._partId)
                                //console.log(' New TessId: '+this._tessNodeId)
                                //this._viewer.model.setNodesOpacity([this._partId], 0.8);
                            }
                            else{
                                // switch tess visibility
                                let isVisib = this._viewer.model.getNodeVisibility(this._tessNodeId)
                                this._viewer.model.setNodesVisibility([this._tessNodeId], !isVisib);
                                //this._viewer.model.setNodesOpacity([this._partId], isVisib?1.0:0.7);
                            }
                            handled=true;
                        }
                        break;
                    case Communicator.Button.Middle:
                        this._partId = selection.getNodeId();
                        let isVisib = this._viewer.model.getNodeVisibility(this._partId)
                        this._viewer.model.setNodesVisibility([this._partId], !isVisib);
                        break;
                    default:
                        break
                }

            }
        });
        event.setHandled(handled);
    }

    async onMouseUp(event) {
        if (this._partId !== null) {
            this._partId = null;
            this._tessNodeId = null;
            event.setHandled(true);
        }
    }

    onMouseMove(event) {}
    onMousewheel(event) {}
    onTouchStart(event) {}
    onTouchMove(event) {}
    onTouchEnd(event) {}
    onKeyDown(event) {
        switch(event.getKeyCode()){
            case 27: // ESC key
                this._viewer.model.setNodesVisibility([0], true); // [0] is the root node
                break
            default:
                break
        }
    }
    onKeyUp(event) {}
    onDeactivate() {}
    onActivate() {}
    onViewOrientationChange() {}
    stopInteraction() {}

    _generateTessfromFaces(nodeId) {
        return new Promise((resolve) => {
            let model = this._viewer.model;
            let meshData = new Communicator.MeshData();
            model.getNodeMeshData(nodeId).then(async (nodeMeshData) => {
                let faces = nodeMeshData.faces;
                for (let ii = 0; ii < faces.elementCount; ii++) {
                    let element = faces.element(ii);
                    if (element.vertexCount == 0) continue;
                    let iter = element.iterate();
                    let vertices = []
                    do {
                        let v1 = iter.next()
                        let v2 = iter.next()
                        let v3 = iter.next()
                        vertices = [...v1.position]
                        vertices.push(...v2.position)
                        vertices.push(...v3.position)
                        vertices.push(...v1.position)
                        meshData.addPolyline(vertices);
                    }
                    while (!iter.done())
                }
                let tessId = await model.createMesh(meshData)
                let lineColor = new Communicator.Color.black();
                //let netMatrix = model.getNodeNetMatrix(nodeId);
                let matrix = model.getNodeMatrix(nodeId);
                let flags = Communicator.MeshInstanceCreationFlags.DoNotSelect;
                let tessInstId = new Communicator.MeshInstanceData(tessId, matrix, 'Tess'+nodeId.toString(), null, lineColor, null, flags)
                let parentNode = model.getNodeParent(nodeId);
                let preventFromResetting = true;
                let isOutOfHierarchy = false;
                this._tessNodeId = await model.createMeshInstance(tessInstId, parentNode, preventFromResetting, isOutOfHierarchy)
                model.setNodesVisibility([this._tessNodeId], true);
                //console.log(' New TessId: '+this._tessNodeId+ ' Matrix: '+matrix)
                resolve(this._isGenerated.set(nodeId, this._tessNodeId));
            });
        });
    }
}