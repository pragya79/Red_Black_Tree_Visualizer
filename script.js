
class Node {
    constructor(value) {
        this.value = value;
        this.color = "RED";
        this.left = null;
        this.right = null;
        this.parent = null;
    }
}

class RedBlackTree {
    constructor() {
        this.root = null;
    }

    insert(value) {
        const newNode = new Node(value);

        if (this.root === null) {
            this.root = newNode;
            this.root.color = "BLACK";
            return true;
        }

        let curr = this.root;

        while (true) {
            if (value < curr.value) {
                if (curr.left === null) {
                    curr.left = newNode;
                    newNode.parent = curr;
                    break;
                }
                curr = curr.left;
            } else if (value > curr.value) {
                if (curr.right === null) {
                    curr.right = newNode;
                    newNode.parent = curr;
                    break;
                }
                curr = curr.right;
            } else {
                return false;
            }
        }

        this.fixInsert(newNode);
        return true;
    }

    fixInsert(node) {
        while (
            node !== this.root &&
            node.parent.color === "RED"
        ) {
            const parent = node.parent;
            const grandparent = parent.parent;

            if (parent === grandparent.left) {
                const uncle = grandparent.right;

                if (uncle !== null && uncle.color === "RED") {
                    parent.color = "BLACK";
                    uncle.color = "BLACK";
                    grandparent.color = "RED";
                    node = grandparent;
                } else {
                    if (node === parent.right) {
                        node = parent;
                        this.leftRotate(node);
                    }

                    node.parent.color = "BLACK";
                    node.parent.parent.color = "RED";
                    this.rightRotate(node.parent.parent);
                }
            } else {
                const uncle = grandparent.left;

                if (uncle !== null && uncle.color === "RED") {
                    parent.color = "BLACK";
                    uncle.color = "BLACK";
                    grandparent.color = "RED";
                    node = grandparent;
                } else {
                    if (node === parent.left) {
                        node = parent;
                        this.rightRotate(node);
                    }

                    node.parent.color = "BLACK";
                    node.parent.parent.color = "RED";
                    this.leftRotate(node.parent.parent);
                }
            }
        }

        this.root.color = "BLACK";
    }

    leftRotate(node) {
        const pivot = node.right;
        node.right = pivot.left;

        if (pivot.left !== null) {
            pivot.left.parent = node;
        }

        pivot.parent = node.parent;

        if (node.parent === null) {
            this.root = pivot;
        } else if (node === node.parent.left) {
            node.parent.left = pivot;
        } else {
            node.parent.right = pivot;
        }

        pivot.left = node;
        node.parent = pivot;
    }

    rightRotate(node) {
        const pivot = node.left;
        node.left = pivot.right;

        if (pivot.right !== null) {
            pivot.right.parent = node;
        }

        pivot.parent = node.parent;

        if (node.parent === null) {
            this.root = pivot;
        } else if (node === node.parent.right) {
            node.parent.right = pivot;
        } else {
            node.parent.left = pivot;
        }

        pivot.right = node;
        node.parent = pivot;
    }

    inorder(node = this.root) {
        if (node === null) return;

        this.inorder(node.left);
        console.log(node.value);
        this.inorder(node.right);
    }
}

const tree = new RedBlackTree();

function addValue() {
    const input = document.getElementById("valueInput");
    const status = document.getElementById("treeStatus");

    if (input.value.trim() === "") {
        status.textContent = "Enter a number to insert.";
        return;
    }

    const value = Number(input.value);

    if (!Number.isFinite(value)) {
        status.textContent = "Please enter a valid number.";
        return;
    }

    const inserted = tree.insert(value);

    if (!inserted) {
        status.textContent = `${value} already exists in the tree.`;
        return;
    }

    drawTree();

    status.textContent = `Inserted ${value}. Tree rebalanced successfully.`;

    input.value = "";
    input.focus();
}

document.getElementById("insertForm").addEventListener("submit", function(event) {
    event.preventDefault();
    addValue();
});

function drawTree() {
    const svg = document.getElementById("treeCanvas");
    const emptyState = document.getElementById("emptyState");

    svg.replaceChildren();

    if (tree.root === null) {
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";

    const nodes = [];
    let index = 0;
    const total = countNodes(tree.root);
    const spacing = 800 / (total + 1);

    function calculatePositions(node, depth = 0) {
        if (node === null) return;

        calculatePositions(node.left, depth + 1);

        nodes.push({
            node,
            x: (index + 1) * spacing,
            y: 55 + depth * 90
        });

        index++;

        calculatePositions(node.right, depth + 1);
    }

    calculatePositions(tree.root);

    const positions = new Map();

    nodes.forEach(item => {
        positions.set(item.node, item);
    });

    nodes.forEach(item => {
        const node = item.node;

        ["left", "right"].forEach(side => {
            const child = node[side];

            if (child === null) return;

            const childPosition = positions.get(child);
            const line = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

            line.setAttribute("x1", item.x);
            line.setAttribute("y1", item.y);
            line.setAttribute("x2", childPosition.x);
            line.setAttribute("y2", childPosition.y);
            line.setAttribute("stroke", "#c9c9c2");
            line.setAttribute("stroke-width", "1.5");

            svg.appendChild(line);
        });
    });

    nodes.forEach(item => {
        const node = item.node;

        const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        circle.setAttribute("cx", item.x);
        circle.setAttribute("cy", item.y);
        circle.setAttribute("r", "22");
        circle.setAttribute(
            "fill",
            node.color === "RED" ? "#c83d43" : "#242424"
        );

        svg.appendChild(circle);

        const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        text.setAttribute("x", item.x);
        text.setAttribute("y", item.y + 5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "13");
        text.setAttribute("font-family", "Arial, sans-serif");
        text.setAttribute("fill", "#ffffff");
        text.textContent = node.value;

        svg.appendChild(text);
    });
}

function countNodes(node) {
    if (node === null) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
}
