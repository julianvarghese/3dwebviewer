var hwv = null;
var ui = null;
var md = new MobileDetect(window.navigator.userAgent);

window.onload = function () {
  Sample.createViewer().then(
    function (viewer) {
      hwv = viewer;

      window.onresize = function (event) {
        // jQuery resizable triggers onresize, check that the call is not coming from a DOM element object
        if (typeof event.target.getAttribute !== "function") {
          hwv.resizeCanvas();
        }
      };

      var screenConfiguration =
        md.mobile() !== null
          ? Communicator.ScreenConfiguration.Mobile
          : Sample.screenConfiguration;
      var uiConfig = {
        containerId: "content",
        screenConfiguration: screenConfiguration,
        showModelBrowser: true,
        showToolbar: true,
      };

      /**
       * These lines grabs input focus when the canvas is ready and add a
       * listener to grab input focus when the mouse enter the canvas.
       */
      hwv.setCallbacks({
        sceneReady: function () {
          const canvas = hwv.getViewElement();

          /**
           * This line is equivalent to canvas.focus()
           */
          hwv.focusInput(true);

          canvas.addEventListener("mouseenter", function () {
            hwv.focusInput(true);
          });
        },
        modelStructureReady: function () {
          hwv.view.setBackgroundColor(new Communicator.Color(228, 245, 245), new Communicator.Color(26, 86, 204));
          // If model isn't empty, hide dropZone
          let rootNode = hwv.model.getAbsoluteRootNode();
          let children = hwv.model.getNodeChildren(rootNode)
          if (children.length > 0) {
            dropZone.hide();
          }

          let opMngr = hwv.operatorManager;
          //opMngr.remove(Communicator.OperatorId.Select)
          // Register add'l ops
          let tessOp = new ShowTessOper(hwv);
          let tessOpHdl = opMngr.registerCustomOperator(tessOp);
          opMngr.push(tessOpHdl);
          let spaOp = new spaDebugOper(hwv);
          let spaOpHdl = opMngr.registerCustomOperator(spaOp);
          //opMngr.remove(Communicator.OperatorId.Select)
          opMngr.push(spaOpHdl);
        },
        selectionArray: function (selectionEvents) {
          for (const selectionEvent of selectionEvents) {
            const selection = selectionEvent.getSelection();
            if (selection && selection.getSelectionType() !== Communicator.SelectionType.None) {
              console.log(`Selected Node: ${selection.getNodeId()}`);
            } else {
              console.log("Selected: None");
            }
          }
        },
        subtreeLoaded: function () {
          let rootNode = hwv.model.getAbsoluteRootNode();
          hwv.view.fitNodes([rootNode], 0);
        }
      });

      ui = new Communicator.Ui.Desktop.DesktopUi(hwv, uiConfig);
      hwv.start();

    },
    function (errorReason) {
      var errorDialog = new Communicator.Ui.UiDialog("content");
      errorDialog.setTitle("Viewer Error");
      errorDialog.setText(errorReason);
      errorDialog.show();
    }
  );

  const dropZone = document.getElementById('dropZone')
  dropZone.display((fileurl, filename) => {
    const url = URL.createObjectURL(fileurl)
    console.log(fileurl);
    var model = hwv.model;
    model.clear().then(() => {

      var modelName = url;
      var rootNode = model.getAbsoluteRootNode();
      model.loadSubtreeFromScsFile(rootNode, modelName).then(() => {
        //hwv.view.setBackgroundColor(new Communicator.Color(228, 245, 245), new Communicator.Color(26, 86, 204));
      })
    });
  })
};
