document.addEventListener('DOMContentLoaded', () => {
    const weightBin = document.getElementById('weight-bin');
    const trayLeft = document.getElementById('tray-left');
    const trayRight = document.getElementById('tray-right');
    const beam = document.getElementById('beam');
    const resetButton = document.getElementById('reset-button');

    // Define weights with their properties (color, value, id) - DUPLICATED weights
    const weightsData = [
        { baseId: 'weight-blue', color: 'blue', value: 1, label: '1' },
        { baseId: 'weight-green', color: 'green', value: 2, label: '2' },
        { baseId: 'weight-red', color: 'red', value: 3, label: '3' },
        { baseId: 'weight-yellow', color: 'purple', value: 4, label: '4' }
    ];

    let weights = []; // Array to store weight objects

    // Create weight elements and add them to the weight bin - DUPLICATE CREATION
    weightsData.forEach(data => {
        for (let i = 0; i < 2; i++) { // Create two of each weight type
            const weightElement = document.createElement('div');
            const weightId = `${data.baseId}-${i + 1}`; // Unique ID for each weight instance
            weightElement.id = weightId;
            weightElement.className = 'weight';
            weightElement.textContent = data.label;
            weightElement.style.backgroundColor = data.color;
            weightElement.draggable = true;
            weightBin.appendChild(weightElement);

            weights.push({
                id: weightId,
                element: weightElement,
                value: data.value,
                baseId: data.baseId, // Store baseId for reset purposes
                originalBinPosition: null,
                tray: null
            });
        }
    });

    // Store initial positions in the bin
    weights.forEach(weight => {
        weight.originalBinPosition = {
            top: weight.element.offsetTop,
            left: weight.element.offsetLeft
        };
    });

    let draggedWeight = null;

    weightBin.addEventListener('dragstart', (event) => {
        draggedWeight = weights.find(weight => weight.element === event.target);
        if (draggedWeight) {
            draggedWeight.element.classList.add('dragging');
        }
        event.dataTransfer.setData('text/plain', event.target.id);
    });

    weightBin.addEventListener('dragend', (event) => {
        if (draggedWeight) {
            draggedWeight.element.classList.remove('dragging');
            draggedWeight = null;
        }
    });

    trayLeft.addEventListener('dragover', allowDrop);
    trayRight.addEventListener('dragover', allowDrop);
    weightBin.addEventListener('dragover', allowDrop);

    function allowDrop(event) {
        event.preventDefault();
    }

    trayLeft.addEventListener('drop', (event) => handleDrop(event, 'left'));
    trayRight.addEventListener('drop', (event) => handleDrop(event, 'right'));
    weightBin.addEventListener('drop', (event) => handleDrop(event, 'bin'));

    function handleDrop(event, target) {
        event.preventDefault();
        const weightId = event.dataTransfer.getData('text/plain');
        const droppedWeight = weights.find(weight => weight.id === weightId);

        if (!droppedWeight) return;

        if (target === 'left' || target === 'right') {
            const trayElement = (target === 'left') ? trayLeft : trayRight;
            trayElement.appendChild(droppedWeight.element);
            droppedWeight.tray = target;
        } else if (target === 'bin') {
            weightBin.appendChild(droppedWeight.element);
            droppedWeight.tray = null;
            droppedWeight.element.style.position = 'static';
            droppedWeight.element.style.top = '';
            droppedWeight.element.style.left = '';
            droppedWeight.element.style.transform = '';
        }

        updateSeesawBalance();
    }

    function updateSeesawBalance() {
        let leftWeight = 0;
        let rightWeight = 0;

        weights.forEach(weight => {
            if (weight.tray === 'left') {
                leftWeight += weight.value;
            } else if (weight.tray === 'right') {
                rightWeight += weight.value;
            }
        });

        const balanceFactor = 10;
        let angle = (rightWeight - leftWeight) * balanceFactor;
        angle = Math.max(-45, Math.min(45, angle));

        beam.style.transform = `rotate(${angle}deg)`;
    }

    // Reset Button Functionality
    resetButton.addEventListener('click', () => {
        weights.forEach(weight => {
            weightBin.appendChild(weight.element); // Move back to bin
            weight.tray = null; // Reset tray status
            weight.element.style.position = 'static'; // Reset positioning
            weight.element.style.top = '';
            weight.element.style.left = '';
            weight.element.style.transform = '';
        });
        updateSeesawBalance(); // Reset seesaw angle to 0
    });
});