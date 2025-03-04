let components = [];
let wires = [];
let history = [];
let undoneHistory = [];
let isDrawingWire = false;
let currentWire = null;
let startComponent = null;

// Component management
function addComponent(type) {
    const component = {
        id: Date.now(),
        type,
        x: 100,
        y: 100,
        connections: []
    };

    components.push(component);
    updateHistory();
    renderComponent(component);
}

function renderComponent(component) {
    const canvas = document.getElementById('canvas');
    
    const el = document.createElement('div');
    el.className = `component ${component.type}`;
    el.id = `comp-${component.id}`;
    el.style.left = `${component.x}px`;
    el.style.top = `${component.y}px`;

    if (component.type.includes('port')) {
        el.classList.add('port');
        el.textContent = component.type === 'positive' ? '+' : '-';
    } else if (component.type === 'bulb') {
        el.classList.add('bulb');
    }

    makeDraggable(el, component);
    canvas.appendChild(el);
}

// Draggable functionality
function makeDraggable(el, component) {
    interact(el).draggable({
        listeners: {
            move(event) {
                component.x += event.dx;
                component.y += event.dy;
                event.target.style.transform = `translate(${component.x}px, ${component.y}px)`;
                updateConnectedWires(component);
            }
        }
    });
}

function updateConnectedWires(component) {
    wires.forEach(wire => {
        if (wire.startComponent === component.id || wire.endComponent === component.id) {
            drawWire(wire);
        }
    });
}

// Wire functionality
function toggleWireMode() {
    isDrawingWire = !isDrawingWire;
    document.querySelectorAll('.component').forEach(el => {
        el.style.cursor = isDrawingWire ? 'crosshair' : 'move';
    });
}

function handleMouseDown(e) {
    if (!isDrawingWire) return;

    const component = getComponentUnderCursor(e);
    if (component) {
        startComponent = component;
        currentWire = {
            id: Date.now(),
            startX: component.x + 10,
            startY: component.y + 10,
            endX: component.x + 10,
            endY: component.y + 10,
            startComponent: component.id,
            endComponent: null,
            element: null
        };
    }
}

function handleMouseMove(e) {
    if (!isDrawingWire || !currentWire) return;

    currentWire.endX = e.clientX - canvas.getBoundingClientRect().left;
    currentWire.endY = e.clientY - canvas.getBoundingClientRect().top;
    
    if (!currentWire.element) {
        currentWire.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        currentWire.element.classList.add('wire');
        currentWire.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        currentWire.path.classList.add('drawing-wire');
        currentWire.element.appendChild(currentWire.path);
        canvas.appendChild(currentWire.element);
    }

    currentWire.path.setAttribute('d', 
        `M ${currentWire.startX} ${currentWire.startY} L ${currentWire.endX} ${currentWire.endY}`
    );
}

function handleMouseUp(e) {
    if (!isDrawingWire || !currentWire) return;

    const endComponent = getComponentUnderCursor(e);
    if (endComponent && startComponent.id !== endComponent.id) {
        currentWire.endComponent = endComponent.id;
        wires.push(currentWire);
        drawWire(currentWire);
        updateHistory();
    } else {
        currentWire.element?.remove();
    }

    currentWire = null;
    startComponent = null;
}

function drawWire(wire) {
    const startComp = components.find(c => c.id === wire.startComponent);
    const endComp = components.find(c => c.id === wire.endComponent);
    
    if (!wire.element) {
        wire.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        wire.element.classList.add('wire');
        wire.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wire.path.classList.add('wire-path');
        wire.element.appendChild(wire.path);
        canvas.appendChild(wire.element);
    }

    const startX = startComp.x + 10;
    const startY = startComp.y + 10;
    const endX = endComp.x + 10;
    const endY = endComp.y + 10;

    wire.path.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
}

// Undo/Redo functionality
function updateHistory() {
    history.push({
        components: [...components],
        wires: [...wires]
    });
    undoneHistory = [];
}

function undo() {
    if (history.length > 1) {
        undoneHistory.push(history.pop());
        const state = history[history.length - 1];
        components = [...state.components];
        wires = [...state.wires];
        redrawCanvas();
    }
}

function redo() {
    if (undoneHistory.length > 0) {
        const state = undoneHistory.pop();
        history.push(state);
        components = [...state.components];
        wires = [...state.wires];
        redrawCanvas();
    }
}

function redrawCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';
    components.forEach(renderComponent);
    wires.forEach(drawWire);
}

// Utility functions
function getComponentUnderCursor(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return components.find(component => {
        return x >= component.x && x <= component.x + 30 &&
               y >= component.y && y <= component.y + 30;
    });
}