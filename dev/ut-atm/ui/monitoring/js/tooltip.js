(function() {
    var tooltip = document.createElement('DIV');
    var message = document.createElement('P');
    tooltip.setAttribute('id', 'activeToolTip');
    tooltip.setAttribute('class', 'tool_tip');
    tooltip.appendChild(message);
    tooltip.style.opacity = '0';
    document.body.appendChild(tooltip);

    var toolTipHeight = tooltip.scrollHeight;
    var toolTipWidth = tooltip.scrollWidth;

    function setTooltipPosition(e) {
        var mouseX = e.x;
        var mouseY = e.y;

        var tipHeight = toolTipHeight + (toolTipHeight * 0.2);
        var tipPos = mouseY - tipHeight;

        if (tipPos < 10) {
            tipPos = mouseY + 20;
        }

        tooltip.style.top = tipPos + 'px';

        var tipWidth = toolTipWidth / 4;
        var tipPosY = mouseX - tipWidth;

        if (tipPosY < 10) {
            tipPosY = 10;
        } else if (tipPosY + toolTipWidth > window.innerWidth) {
            tipPosY = window.innerWidth - (toolTipWidth + 10);
        }

        tooltip.style.left = tipPosY + 'px';
    }

    document.addEventListener('mouseover', function handleMouseOver(e) {
        if (e.target.dataset && e.target.dataset.tooltipText) {
            e.preventDefault();
            message.innerHTML = e.target.dataset.tooltipText;
            toolTipHeight = tooltip.scrollHeight;
            toolTipWidth = tooltip.scrollWidth;
            setTooltipPosition(e);
            tooltip.style.opacity = '1';
        }
    });
    document.addEventListener('mousemove', function handleMouseMove(e) {
        if (e.target.dataset && e.target.dataset.tooltipText) {
            setTooltipPosition(e);
        }
    });
    document.addEventListener('mouseout', function(e) {
        tooltip.style.opacity =
        tooltip.style.top =
        tooltip.style.left = 0;
    });

    window.app = window.app || {};
    window.app.hideTooltip = function() {
        tooltip.style.opacity =
        tooltip.style.top =
        tooltip.style.left = 0;
    };
})();
