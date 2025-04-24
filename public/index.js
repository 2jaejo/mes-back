const cols = 16;
const rows = 12;
const cellSize = 50;
const width = cols * cellSize;
const height = rows * cellSize;

const stage = new Konva.Stage({ container: 'container', width, height });
const layer = new Konva.Layer();

stage.add(layer);



const data = { holder: [], pin: [], battery: [], nikel: [] };
let holder_idCounter = 1;
let pin_idCounter = 1;
let battery_idCounter = 1;
let nikel_idCounter = 1;


const groupMap = {};
const zOrderMap = {
  grid: 0,
  holder: 1,
  pin: 2,
};

// 그룹 생성 함수
function getOrCreateGroup(name) {
  if (groupMap[name]) return groupMap[name];

  const group = new Konva.Group({ name });
  layer.add(group);
  group.zIndex(zOrderMap[name]);
  groupMap[name] = group;

  return group;
}

// 배경 격자 전용 그룹 생성
const gridGroup = getOrCreateGroup('grid');

// 격자 배경 그리기
for (let i = 0; i < cols; i++) {
  for (let j = 0; j < rows; j++) {
    gridGroup.add(new Konva.Rect({
      x: i * cellSize,
      y: j * cellSize,
      width: cellSize,
      height: cellSize,
      stroke: '#ddd',
      listening: false,
      name: 'grid',
    }));
  }
}


// 스냅
function snapToGrid(pos) {
  return {
    x: Math.round(pos.x / cellSize) * cellSize,
    y: Math.round(pos.y / cellSize) * cellSize,
  };
}


// 스냅 미리보기 사각형
let snapPreviewRect = null;

// 스냅 미리보기 사각형 초기화
function initSnapPreviewRect(layer) {
  if (snapPreviewRect) return;

  snapPreviewRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fill: 'green',
    opacity: 0.5,
    listening: false,
    visible: false,
  });

  layer.add(snapPreviewRect);
}


// 홀더가 차지하는 셀 좌표 계산
function getOccupiedCells(x, y, colSpan, rowSpan) {
  const startCol = Math.round(x / cellSize);
  const startRow = Math.round(y / cellSize);
  const cells = [];
  for (let i = 0; i < rowSpan; i++) {
    for (let j = 0; j < colSpan; j++) {
      cells.push({ row: startRow + i, col: startCol + j });
    }
  }
  
  return cells;
}

// 기존 홀더들과 겹치는지 확인
function isHolderCellOverlapping(x, y, colSpan, rowSpan, excludeId = null) {
  const newCells = getOccupiedCells(x, y, colSpan, rowSpan);

  for (const h of data.holder) {
    if (h.id === excludeId) continue;

    const existingCells = getOccupiedCells(h.x, h.y, h.width / cellSize, h.height / cellSize);
    for (const nc of newCells) {
      if (existingCells.some(ec => ec.row === nc.row && ec.col === nc.col)) {
        return true; // 겹치는 셀이 하나라도 있음
      }
    }
  }

  return false;
}


// 비어있는 셀 위치 찾기
function findAvailableHolderPosition(colSpan, rowSpan) {
  const maxCols = Math.floor(width / cellSize);
  const maxRows = Math.floor(height / cellSize);

  for (let row = maxRows - rowSpan; row >= 0; row--) {
    for (let col = 0; col <= maxCols - colSpan; col++) {
      const x = col * cellSize;
      const y = row * cellSize;

      const isOverlap = isHolderCellOverlapping(x, y, colSpan, rowSpan);
      if (!isOverlap) {
        return { x, y };
      }
    }
  }

  return null; // 빈 공간 없음
}




// 홀더 추가
function addHolder() {

  const type = document.getElementById('sel-holder-type').value;
  const [colSpan, rowSpan] = type.split('x').map(Number);
  
  const pos = findAvailableHolderPosition(colSpan, rowSpan);
  if (!pos) {
    showToast('추가할 수 있는 공간이 없습니다.');
    return;
  }

  const rect = new Konva.Rect({
    x: pos.x,
    y: pos.y,
    width: (cellSize) * colSpan,
    height: (cellSize) * rowSpan,
    fill: 'gray',
    stroke: 'black',
    strokeWidth: 1,
    draggable: true,
    id: `holder${holder_idCounter++}`,
    name: 'holder',
    dragBoundFunc: function (pos) {
      // 셀 단위 위치 + 캔버스 밖 제한
      const maxX = width - (colSpan * cellSize);
      const maxY = height - (rowSpan * cellSize);

      return {
        x: Math.max(0, Math.min(pos.x, maxX)),
        y: Math.max(0, Math.min(pos.y, maxY))
      };
    }
    
  });

  
  
  rect.on('mouseover', function (e) {
    e.target.getStage().container().style.cursor = 'pointer';
  });
  rect.on('mouseout', function (e) {
    e.target.getStage().container().style.cursor = 'default';
  });


  rect.on('dragmove', (e) => {
    const shape = e.target;

    initSnapPreviewRect(layer); // 녹색 스냅 박스 생성

    const rawPos = rect.position();
    const snapped = snapToGrid(rawPos);

    snapPreviewRect.position({ x: snapped.x, y: snapped.y });
    snapPreviewRect.size({ width: rect.width(), height: rect.height() });
    snapPreviewRect.show();

    if (isHolderCellOverlapping(snapped.x, snapped.y, colSpan, rowSpan, rect.id())) {
      snapPreviewRect.fill('red');
    }
    else {
      snapPreviewRect.fill('green');
    }


    layer.batchDraw();

  });

  rect.on('dragstart', () => {
    rect._originalPos = {
      x: rect.x(),
      y: rect.y(),
    };
  });

  rect.on('dragend', (e) => {
    console.log('dragend');
    const shape = e.target;

    // 스냅 미리보기 사각형 초기화
    if (snapPreviewRect) snapPreviewRect.hide();

     // 기존 위치 확인/스냅/충돌 로직 이어서...
    const rawPos = rect.position();
    const snapped = snapToGrid(rawPos);

    if (isHolderCellOverlapping(snapped.x, snapped.y, colSpan, rowSpan, rect.id())) {
      showToast('충돌');
      rect.position(rect._originalPos); // 되돌리기
    } else {
      rect.position({ x: snapped.x, y: snapped.y });
      const h = data.holder.find(d => d.id === rect.id());
      if (h) {
        h.x = snapped.x;
        h.y = snapped.y;
      }
    }

    layer.draw();
  });

  rect.on('contextmenu', (e) => {
    e.evt.preventDefault();
  
    rect.destroy();
    data.holder = data.holder.filter(h => h.id !== rect.id());
    layer.draw();
    
  });


  data.holder.push({ id: rect.id(), x: rect.x(), y: rect.y(), width: rect.width(), height: rect.height(), colSpan, rowSpan });
  layer.add(rect);

  const holderGroup = getOrCreateGroup('holder');
  holderGroup.add(rect);
  holderGroup.zIndex(zOrderMap['holder']); // 다시 고정

  layer.draw();



}











function addPin() {
  // 기본 위치
  const initial = { x: 100, y: 100 };
  const r = cellSize / 4; 

  const pin = new Konva.Circle({
    x: initial.x,
    y: initial.y,
    radius: r,
    fill: 'blue',
    stroke: 'black',
    strokeWidth: 1,
    draggable: true,
    id: `pin${pin_idCounter++}`,
    dragBoundFunc: function (pos) {
      // 캔버스 안에서만 이동 가능
      const radius = this.radius();
      const newX = Math.min(Math.max(pos.x, radius), width - radius);
      const newY = Math.min(Math.max(pos.y, radius), height - radius);
      return { x: newX, y: newY };
    }
  });

  pin.on('mouseover', function (e) {
    e.target.getStage().container().style.cursor = 'crosshair';
  });
  pin.on('mouseout', function (e) {
    e.target.getStage().container().style.cursor = 'default';
  });

  pin.on('dragend', (e) => {
    const shape = e.target;
    const pinPos = shape.position();

    let closestCorner = null;
    let minDist = Infinity;

    // 모든 홀더의 꼭짓점 중 가장 가까운 점 찾기
    data.holder.forEach(holderData => {
      const corners = getHolderCorners({
        x: holderData.x,
        y: holderData.y,
        width: cellSize,
        height: cellSize
      });

      corners.forEach(corner => {
        const dx = corner.x - pinPos.x;
        const dy = corner.y - pinPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestCorner = corner;
        }
      });
    });

    // 가장 가까운 꼭짓점에 스냅
    if (closestCorner) {
      if (isOverlapping('pin',closestCorner.x, closestCorner.y, shape.id())) {
        showToast("이미 다른 핀이 설치되어 있습니다.");
        shape.position(initial); // 되돌리기
      } else {
        shape.position(closestCorner);
        const obj = data.pin.find(d => d.id === shape.id());
        if (obj) {
          obj.x = shape.x();
          obj.y = shape.y();
        }
      }
    } else {
      showToast("유효한 위치에만 핀을 설치할 수 있습니다.");
      shape.position(initial); // 되돌리기
    }

    // 데이터 갱신
    const obj = data.pin.find(d => d.id === shape.id());
    if (obj) {
      obj.x = shape.x();
      obj.y = shape.y();
    }

    layer.draw();
  });

  data.pin.push({ id: pin.id(), x: initial.x, y: initial.y });
  layer.add(pin);

  const pinGroup = getOrCreateGroup('pin');
  pinGroup.add(pin);
  pinGroup.zIndex(zOrderMap['pin']); // 다시 고정

  layer.draw();

}

function printData() {
  console.log(data);
  alert('콘솔에서 데이터 확인');
}



function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.background = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '10px 16px';
  toast.style.marginTop = '10px';
  toast.style.borderRadius = '4px';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s';
  container.appendChild(toast);

  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}