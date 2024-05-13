class TrainVisibilityOper {
    constructor(viewer) {
        this._viewer = viewer;
        this._partId = null;
    }

    onMouseDown(event) {
        const pickConfig = new Communicator.PickConfig(Communicator.SelectionMask.All);
        this._viewer.view.pickFromPoint(event.getPosition(), pickConfig).then((selection) => {
            if (selection.getSelectionType() !== Communicator.SelectionType.None) {
                this._partId = selection.getNodeId();
                switch (event.getButton()) {
                    case Communicator.Button.Left:
                        this._viewer.model.setNodesOpacity([this._partId], 0.5);
                        break;
                    case Communicator.Button.Middle:
                        this._viewer.model.setNodesVisibility([this._partId], false);
                        break;
                    default:
                        break
                }

            }
        });
        //event.setHandled(true);
    }

    onMouseUp(event) {
        if (this._partId !== null) {
            this._viewer.model.setNodesOpacity([this._partId], 1.0);
            this._partId = null;
        }
        //event.setHandled(true);
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
}