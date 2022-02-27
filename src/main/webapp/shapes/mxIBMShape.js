/**
 * $Id: mxIBMShape.js,v 1.0 2022/04/30 17:00:00 mate Exp $
 * Copyright (c) 2022, JGraph Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


//**********************************************************************************************************************************************************
// Base Shapes
//**********************************************************************************************************************************************************
//
function mxIBMShapeBase(bounds, fill, stroke, strokewidth)
{
	const ibmConfigured = Editor.configure(ibmConfig, true);
	mxShape.call(this, bounds, fill, stroke, strokewidth);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

mxUtils.extend(mxIBMShapeBase, mxShape);

mxIBMShapeBase.prototype.cst = ibmConfig.ibmBaseConstants; 

mxIBMShapeBase.prototype.customProperties = ibmConfig.ibmBaseProperties;


// Convert RGB values to hex values.
mxIBMShapeBase.prototype.rgb2hex = function(color)
{
	if (color.toUpperCase().startsWith('RGB'))
	{
		let rgb = color.split(',');
		let r = parseInt(rgb[0].substring(4));
		let g = parseInt(rgb[1]);
		let b = parseInt(rgb[2]);
		var rhex = Number(r).toString(16)
		rhex = (rhex.length < 2) ? "0" + rhex : rhex;
		var ghex = Number(r).toString(16)
		ghex = (ghex.length < 2) ? "0" + ghex : ghex;
		var bhex = Number(r).toString(16)
		bhex = (bhex.length < 2) ? "0" + bhex : bhex;
		return "#" + rhex.toString() + ghex.toString() + bhex.toString();
	}
	else
		return color;
}

// Normalize line color.
mxIBMShapeBase.prototype.normalizeLineColor = function(lineColor)
{
}

// Normalize fill color and line color.
mxIBMShapeBase.prototype.normalizeFillColor = function(fillColor, lineColor)
{
	let fillColorHex = this.rgb2hex(fillColor);
        let fillColorUpper = fillColorHex.toUpperCase();
        let fillColorName = ibmConfig.colorNames[(fillColorUpper === "NONE") ? "NONE" : fillColorUpper.substring(1)];

	let lineColorHex = this.rgb2hex(lineColor);
        let lineColorUpper = lineColorHex.toUpperCase();
        let lineColorName = ibmConfig.colorNames[(lineColorUpper === "NONE") ? "NONE" : lineColorUpper.substring(1)];

        if (fillColorName === "NONE")
		return "none";
	else if (fillColorName === "White")
                return ibmConfig.ibmColors.white; 
        else if (fillColorName === "Black" || fillColorName === "Transparent")
                return ibmConfig.ibmColors.none; 
	else {
                let lineColorSegments = lineColorName.toLowerCase().split(' ');
                let lineColorFamily = lineColorSegments[0];

                if (lineColorSegments[1] === "gray")
                        lineColorFamily = lineColorFamily + "gray";

                return ibmConfig.ibmColors["light" + lineColorFamily]; 
        }
}

// Normalize font/icon/style color to be visible if lineColor is too dark.
mxIBMShapeBase.prototype.normalizeFontColor = function(fontColor, lineColor)
{
	if (lineColor === "none")
		return fontColor;
	else if (lineColor === ibmConfig.ibmColors.black)
		return ibmConfig.ibmColors.white;

	lineColor = lineColor.toUpperCase();
	let name = ibmConfig.colorNames[lineColor.substring(1)];
	let segments = name.split(' ');

	for (var index = 0; index < segments.length; index++)
	{
		code = parseInt(segments[index]);
		if (!isNaN(code) && code >= 50)
			return ibmConfig.ibmColors.white;
	}

	return fontColor;
}

// Retrieve color settings.
mxIBMShapeBase.prototype.getColors = function(shape, shapeType, shapeLayout)
{
	// Retrieve color settings.
	let lineColor = mxUtils.getValue(shape.state.style, this.cst.LINE_COLOR, this.cst.LINE_COLOR_DEFAULT);
	let fillColor = mxUtils.getValue(shape.state.style, this.cst.FILL_COLOR, this.cst.FILL_COLOR_DEFAULT);
	let fontColor = mxUtils.getValue(shape.state.style, this.cst.FONT_COLOR, this.cst.FONT_COLOR_DEFAULT);
	let badgeColor = mxUtils.getValue(shape.state.style, this.cst.BADGE_COLOR, this.cst.BADGE_COLOR_DEFAULT);

	let badgeFontColor = fontColor;
	let iconColor = fontColor;
	let iconAreaColor = (shapeType.startsWith('group')) ? 'none' : lineColor;
	let styleColor = lineColor;

	// Set line color to black if not set otherwise use line color.
	lineColor = (lineColor === this.cst.LINE_COLOR_DEFAULT) ? ibmConfig.ibmColors.black : this.rgb2hex(lineColor);

	// Set fill color to transparent if not set otherwise use fill color.
	fillColor = (fillColor === this.cst.FILL_COLOR_DEFAULT) ? ibmConfig.ibmColors.none : this.rgb2hex(fillColor);

	// Set fill color to same as line color for legend color items.
	fillColor = (shapeLayout === 'itemColor') ? lineColor : fillColor;

	// Set font and icon colors to black if not set otherwise use font color.
	fontColor = (fontColor === this.cst.FONT_COLOR_DEFAULT) ? ibmConfig.ibmColors.black : this.rgb2hex(fontColor);

	// Normalize font color to be visible for expanded target shape type.
	fontColor = (shapeType === 'target' && shapeLayout.startsWith('expanded')) ? this.normalizeFontColor(fontColor, iconAreaColor) : fontColor;

	// Set badge color to line color if not set otherwise use badge color.
	badgeColor = (badgeColor === this.cst.BADGE_COLOR_DEFAULT) ? lineColor : this.rgb2hex(badgeColor);

	// Normalize badge font color to be visible if badge color is too dark.
	badgeFontColor = this.normalizeFontColor(badgeFontColor, badgeColor);

	// Normalize icon color to be visible if icon area color is too dark.
	iconColor = this.normalizeFontColor(ibmConfig.ibmColors.black, iconAreaColor);

	// Set icon color to black for legend icon items.
	iconColor = (shapeLayout === 'itemIcon') ? ibmConfig.ibmColors.black : iconColor;

	// Normalize style color to be visibile if icon area color is too dark.
	styleColor = this.normalizeFontColor(styleColor, iconAreaColor);

	// Set style color to black for expanded shapes and legend style items.
	styleColor = (shapeLayout.startsWith('expanded') || shapeLayout === 'itemStyle') ? ibmConfig.ibmColors.black : styleColor;

	return {'lineColor': lineColor,
		'fillColor': fillColor, 
		'fontColor': fontColor, 
		'badgeColor': badgeColor,
		'badgeFontColor': badgeFontColor,
		'iconColor': iconColor,
		'iconAreaColor': iconAreaColor,
		'styleColor': styleColor};
}

// Retrieve size and color details.
mxIBMShapeBase.prototype.getDetails = function(shape, shapeType, shapeLayout, shapeWidth, shapeHeight)
{
        let details = {};

        // Get shape-specific sizes.

        if (shapeLayout === 'collapsed') {
                if (shapeType === 'target')
                        details = ibmConfig.ibmShapeSizes.collapsedTarget;
                else if (shapeType === 'actor')
                        details = ibmConfig.ibmShapeSizes.collapsedActor;
                else
                        details = ibmConfig.ibmShapeSizes.collapsed;

                details['shapeWidth'] = shapeWidth;
                details['shapeHeight'] = shapeHeight;
        }
        else if (shapeLayout.startsWith('expanded')) {
                if (shapeType === 'target')
                        details = ibmConfig.ibmShapeSizes.expandedTarget;
                else if (shapeType.startsWith('group'))
                        details = ibmConfig.ibmShapeSizes.group;
                else
                        details = ibmConfig.ibmShapeSizes.expanded;

                details['shapeWidth'] = shapeWidth;
                details['shapeHeight'] = shapeHeight;
        }
        else {
                if (shapeLayout === 'itemBadge')
                        details = ibmConfig.ibmShapeSizes.itemBadge;
                else if (shapeLayout === 'itemColor')
                        details = ibmConfig.ibmShapeSizes.itemColor;
                else if (shapeLayout === 'itemStyle')
                        details = ibmConfig.ibmShapeSizes.itemStyle;
                else if (shapeLayout === 'itemIcon' && shapeType === 'target')
                        details = ibmConfig.ibmShapeSizes.itemTarget;
                else if (shapeLayout === 'itemIcon' && shapeType === 'actor')
                        details = ibmConfig.ibmShapeSizes.itemActor;
                else if (shapeLayout === 'itemIcon')
                        details = ibmConfig.ibmShapeSizes.itemIcon;
                else // (shapeLayout === 'itemShape')
                        details = ibmConfig.ibmShapeSizes.itemShape;

                details['shapeWidth'] = details.defaultWidth;
                details['shapeHeight'] = details.defaultHeight;
        }

        // Add shape colors.

        if (shape) {
                let colors = this.getColors(shape, shapeType, shapeLayout);

                details['lineColor'] = colors.lineColor;
                details['fillColor'] = colors.fillColor;
                details['fontColor'] = colors.fontColor;
                details['badgeColor'] = colors.badgeColor;
                details['badgeFontColor'] = colors.badgeFontColor;
                details['iconColor'] = colors.iconColor;
                details['iconAreaColor']  = colors.iconAreaColor;
                details['styleColor']  = colors.styleColor;
        }

        return details;
}

// Get properties corresponding to shape layout and convert to styles.
mxIBMShapeBase.prototype.getCellStyles = function(shapeLayout)
{
	let properties = '';
	let styles = {};

	// Get shape-specific properties.
	
	if (shapeLayout === "collapsed")
		// Add collapsed text properties and remove expanded stack and container properties.
		properties = ibmConfig.ibmSystemProperties.collapsedLabel + ibmConfig.ibmSystemProperties.expandedStackNull + ibmConfig.ibmSystemProperties.containerNull;
	else if (shapeLayout === "expanded")
		// Add expanded text and container properties and remove expanded stack properties.
		properties = ibmConfig.ibmSystemProperties.expandedLabel + ibmConfig.ibmSystemProperties.container + ibmConfig.ibmSystemProperties.expandedStackNull;
	else if (shapeLayout === "expandedStack")
		// Add expanded text, expanded stack properties, and container properties.
		properties = ibmConfig.ibmSystemProperties.expandedLabel + ibmConfig.ibmSystemProperties.expandedStack + ibmConfig.ibmSystemProperties.container;
	else if (shapeLayout.startsWith("group"))
		// Add expanded text and container properties and remove expanded stack properties.
		properties = ibmConfig.ibmSystemProperties.expandedLabel + ibmConfig.ibmSystemProperties.container + ibmConfig.ibmSystemProperties.expandedStackNull;
	else
		// Remove expanded stack and container properties.
		properties = ibmConfig.ibmSystemProperties.expandedStackNull + ibmConfig.ibmSystemProperties.containerNull;

	// Convert properties to a style dictionary.
	
	properties = properties.slice(0, -1); // Remove trailing semicolon.

	let array = properties.split(';');

	for (var index = 0; index < array.length; index++)
	{
		element = array[index].split('=');
		if (element[1] === 'null')
			styles[element[0]] = null;
		else	
			styles[element[0]] = element[1];
	}

	return styles;
}

// Set cell styles.
mxIBMShapeBase.prototype.setCellStyles = function(graph, shapeType)
{
	let cells = graph.getSelectionCells();
	let styles = this.getCellStyles(shapeType);

	for (let key in styles)
		graph.setCellStyles(key, styles[key], cells);
};

// Return switch icon if switching between logical to prescribed or prescribed to logical.
mxIBMShapeBase.prototype.switchIcon = function(previousIcon, previousType, currentType)
{
	if (previousType.slice(-1) === 'l' && currentType.slice(-1) === 'p')
		// Lookup logical icon in ibmIcons and switch to prescribed icon if available.
		return("undefined");
	else if (previousType.slice(-1) === 'p' && currentType.slice(-1) === 'l')
		// Lookup prescribed icon in ibmIcons and switch to logical icon if available.
		return("undefined");
	else
		return previousIcon;
}

mxIBMShapeBase.prototype.getDimensions = function(shape, shapeType, shapeLayout, width, height)
{
                let minWidth = 0;
                let defaultWidth = 0;
                let minHeight = shapeLayout.startsWith('item') ? 16 : 48;

                let labelHeight = shapeLayout.startsWith('expanded') ? 48 : 16;
                let labelAlign = 0;
                
                let shapeWidth = width;
                let shapeHeight = shapeLayout.startsWith('legend') ? 16 : height;
                let curveRadius = (shapeType === 'target' || shapeType === 'actor') ? 24 : 8;
                let shapeAlign = (shapeType === 'target' && shapeLayout === 'itemShape') ? -2 : 0;
                
                let sidebarWidth = 0;
                let sidebarHeight = 0;

                let sidetickWidth = 8;
                let sidetickHeight = 4;
                let sidetickLeftStart = -4;

                let multiplicityOffset = 4;
                let doubleOffset = 3;

                let iconSize = 20;
                let iconSpacing = 14;

                let iconAreaWidth = 0;

                if (shapeLayout === 'collapsed')
                {
                        minWidth = (shapeType === 'target') ? 64 : 48;
                        defaultWidth = minWidth;
                        labelAlign = 0;

                        iconAreaWidth = minWidth;
                }
                else if (shapeLayout.startsWith('expanded'))
                {
                        minWidth = 96;
                        defaultWidth = 240;
                        defaultRectHeight = 152;
                        labelAlign = null;
                        
                        if (shapeType.startsWith('group'))
                                iconAreaWidth = 1*iconSpacing + iconSize
                        else if (shapeType === 'target')
                                iconAreaWidth = 1*iconSpacing + iconSize - 4;
                        else
                                iconAreaWidth = 2*iconSpacing + iconSize;


                        sidebarWidth = 4;
                        sidebarHeight = 48;
                }
                else if (shapeLayout.startsWith('item'))
                {
                        minWidth = 64;
                        defaultWidth = minWidth;

                        if (shapeLayout === 'itemStyle' || shapeLayout === 'itemColor' || shapeLayout === 'itemBadge')
                        {
                                shapeWidth = 32;
                                labelAlign = 40;
                        }
                        else if (shapeType === 'target')
                        {
                                shapeWidth = 20;
                                labelAlign = 24;
                        }
                        else
                        {
                                shapeWidth = 16;
                                labelAlign = 24;
                        }
                                
                        curveRadius = (shapeType === 'target' || shapeType === 'actor') ? 8 : 4;

                        iconAreaWidth = shapeWidth;

                        sidebarWidth = 2;
                        sidebarHeight = 12;

                        sidetickWidth = 4;
                        sidetickHeight = 2;
                        sidetickLeftStart = -2;

                        multiplicityOffset = 2;
                        doubleOffset = 2;

                        iconSize = 16;
                        iconSpacing = 0;
                }

		let iconAreaHeight = minHeight;
		let iconAlign = iconSpacing; 

                let details = {
                        minWidth, minHeight, defaultWidth,
                        shapeWidth, shapeHeight, curveRadius, shapeAlign,
                        iconAreaWidth, sidebarWidth, sidebarHeight,
                        labelHeight, labelAlign,
                        sidetickWidth, sidetickHeight, sidetickLeftStart,
                        multiplicityOffset, doubleOffset,
                        iconSize, iconAlign,
			iconAreaHeight
                };

	// Add shape colors.
	
	if (shape) {
		let colors = this.getColors(shape, shapeType, shapeLayout);

		details['lineColor'] = colors.lineColor;
		details['fillColor'] = colors.fillColor;
		details['fontColor'] = colors.fontColor;
		details['badgeColor'] = colors.badgeColor;
		details['badgeFontColor'] = colors.badgeFontColor;
		details['iconColor'] = colors.iconColor;
		details['iconAreaColor']  = colors.iconAreaColor;
		details['styleColor']  = colors.styleColor;
	}

                //return {
                //        minWidth, minHeight, defaultWidth,
                //        shapeWidth, shapeHeight, curveRadius, shapeAlign,
                //        iconAreaWidth, sidebarWidth, sidebarHeight,
                //        labelHeight, labelAlign,
                //        sidetickWidth, sidetickHeight, sidetickLeftStart,
                //        multiplicityOffset, doubleOffset,
                //        iconSize, iconSpacing
                //};
			
		return details;
}

mxIBMShapeBase.prototype.getProperties = function(shape, width, height)
{
	let shapeLayout = shape.shapeLayout;
	//let shapeSubLayout = shape.shapeSubLayout;

	//let shapeType = ((shapeLayout == 'item' && shapeSubLayout != 'Shape' && shapeSubLayout != 'Icon') ? 
	//		'itemBase' : shape.shapeType);
	let shapeType = shape.shapeType;

	//let shapeVisible = (shapeLayout === 'expanded' || shapeLayout === 'collapsed' || (shapeLayout === 'item' && (shapeSubLayout != 'Badge' && shapeSubLayout != 'Icon')));
	let shapeVisible = (shapeLayout.startsWith('expanded') || shapeLayout === 'collapsed' || (shapeLayout.startsWith('item') && (shapeLayout !== 'itemBadge' && shapeLayout != 'itemIcon')));

	//let iconVisible = ((shapeLayout === 'expanded' || shapeLayout === 'collapsed' || (shapeLayout === 'legend' && shapeSubLayout === 'icon')) && mxUtils.getValue(shape.state.style, mxIBMShapeBase.prototype.cst.ICON_VISIBLE, mxIBMShapeBase.prototype.cst.ICON_VISIBLE_DEFAULT));
	//let hideIcon = (shapeLayout === 'legend' && shapeSubLayout !== 'icon') && !mxUtils.getValue(shape.state.style, mxIBMShapeBase.prototype.cst.HIDE_ICON, mxIBMShapeBase.prototype.cst.HIDE_ICON_DEFAULT);
	let hideIcon = mxUtils.getValue(shape.state.style, mxIBMShapeBase.prototype.cst.HIDE_ICON, mxIBMShapeBase.prototype.cst.HIDE_ICON_DEFAULT);
	//if (shapeLayout === 'item' && shapeSubLayout !== 'Icon') hideIcon = true;
	if (shapeLayout.startsWith('item') && shapeLayout !== 'itemIcon') hideIcon = true;

	let rotateIcon = mxUtils.getValue(shape.state.style, mxIBMShapeBase.prototype.cst.ROTATE_ICON, mxIBMShapeBase.prototype.cst.ROTATE_ICON_DEFAULT);

	let styleDashed = shape.styleDashed;
	let styleDouble = shape.styleDouble;
	let styleStrikethrough = shape.styleStrikethrough;
	let styleMultiplicity = shape.styleMultiplicity;

	//if ((shapeType  === 'itemBase' || shapeSubLayout === 'Shape') && (shapeSubLayout === 'Color' || shapeSubLayout === 'Shape'))
	if (shapeLayout === 'itemColor' || shapeLayout === 'itemShape')
	{
		styleDashed = false;
		styleDouble = false;
		styleStrikethrough = false;
		styleMultiplicity = false;
	}

	//SAVE let details = mxIBMShapeBase.prototype.getDetails(shape, shapeType, shapeLayout, width, height);
	let details = mxIBMShapeBase.prototype.getDimensions(shape, shapeType, shapeLayout, width, height);

	//let colors = this.getColors(shape);

	let lineColor = details.lineColor;
	let fillColor = details.fillColor;
	let fontColor = details.fontColor;
	let badgeColor = details.badgeColor;
	let badgeFontColor = details.badgeFontColor;
	let iconColor = details.iconColor;

	//let cornerColor = shapeType.startsWith('group') ? 'none' : details.iconAreaColor;
	let cornerColor = details.iconAreaColor;
	let styleColor = details.styleColor;

	let secondLine = styleDouble;

	//let cornerVisible = shapeVisible && (!hideIcon || cornerColor != 'none');
	let cornerVisible = shapeVisible && (!hideIcon || cornerColor != 'none');
	if (cornerVisible)
	{
		//if (hideIcon && (shapeLayout.startsWith('expanded') || shapeLayout.startsWith('item')))
		if (hideIcon && ((shapeLayout.startsWith('expanded') && shapeType != 'target') || shapeLayout.startsWith('item')))
			cornerVisible = false;
		else if (shapeLayout.startsWith('item'))
			cornerVisible = false;
	}

	//let details = mxIBMShapeBase.prototype.getDetails(shape, shapeType, shapeLayout, height, width);

	let iconAreaWidth = (cornerVisible) ? details.iconAreaWidth : 0;
	//let cornerHeight = details.minHeight;
	let cornerHeight = details.iconAreaHeight;

	//let barVisible = (shapeType === 'pg' || shapeType === 'lg');
	let barVisible = shapeType.startsWith('group');
	let sidebarWidth = details.sidebarWidth;
	let sidebarHeight = details.sidebarHeight;

	//let tickVisible = (shapeType === 'lc' || shapeType === 'pc');
	let tickVisible = shapeType.startsWith('comp');
	let sidetickWidth = details.sidetickWidth;
	let sidetickHeight = details.sidetickHeight;
	let sidetickLeftStart = details.sidetickLeftStart;

	let badge = mxUtils.getValue(shape.state.style, mxIBMShapeBase.prototype.cst.BADGE, mxIBMShapeBase.prototype.cst.BADGE_DEFAULT);
	//let badgeVisible = (badge != 'none') && (shapeLayout === 'collapsed' || shapeLayout === 'expanded' || (shapeLayout === 'item' && shapeSubLayout === 'Badge'));
	let badgeVisible = (badge != 'none') && (shapeLayout === 'collapsed' || shapeLayout.startsWith('expanded') || shapeLayout === 'itemBadge');
	let badgeText = badgeVisible ? shape.state.cell.getAttribute('Badge-Text', null) : null;

	//SAVE badgeFontColor = this.normalizeFontColor(ibmConfig.ibmColors.black, badgeColor);

	//SAVE iconColor = this.normalizeFontColor(ibmConfig.ibmColors.black, cornerColor);

	if (shapeLayout === 'itemColor' || shapeLayout === 'itemShape')
	{
		secondLine = false;
		//SAVEif (shapeLayout === 'itemColor')
		//SAVE	fillColor = lineColor;  // Line fill color legend.
	}

	if (shapeLayout === 'collapsed' || shapeLayout.startsWith('item'))
	{
		//styleColor = this.isDarkColor(cornerColor) ? ibmConfig.ibmColors.white : lineColor;
		/*SAVE
		if (shapeLayout === 'itemStyle')
			styleColor = lineColor;
		else
			styleColor = this.normalizeFontColor(styleColor, cornerColor);
		*/

		//SAVE if (shapeLayout === 'itemIcon')
		//SAVE	iconColor = ibmConfig.ibmColors.black;

		if (styleDashed)
			//secondLine = this.isDarkColor(cornerColor);
			secondLine = true;
	}
	else if (shapeLayout.startsWith('expanded'))
	{
		//fontColor = (shapeType === 'target' && this.isDarkColor(cornerColor)) ?  ibmConfig.ibmColors.white : fontColor;  // ibmConfig.ibmColors.black;

		if (shapeType === 'target')
		{
			//SAVE fontColor = this.normalizeFontColor(fontColor, cornerColor);

			/*SAVE
			if (styleStrikethrough)
				//styleColor = this.isDarkColor(cornerColor) ?  ibmConfig.ibmColors.white : lineColor;
				styleColor = this.normalizeFontColor(styleColor, cornerColor);
			else if (styleDashed)
				//secondLine = this.isDarkColor(cornerColor);
				secondLine = false;
			*/
			if (styleDashed)
				secondLine = false;
		}
	}

	let labelAlign = 0;

	if (shapeLayout === 'collapsed' || shapeLayout.startsWith('item'))
	{
		labelAlign = details.labelAlign;
	}
	else if (shapeLayout.startsWith('expanded'))
	{
		labelAlign = iconAreaWidth;

		if (shapeType === 'target')
		{
			labelAlign = (!hideIcon) ? labelAlign : 0;
		}
	}

	let labelHeight = details.labelHeight;

	return {
		'shapeType': shapeType,
		'shapeLayout': shapeLayout,
		//'shapeSubLayout': shapeSubLayout,
		'shapeVisible': shapeVisible,

		'hideIcon': hideIcon,
		'rotateIcon': rotateIcon,

		'styleDashed': styleDashed,
		'styleDouble': styleDouble,
		'styleStrikethrough': styleStrikethrough,
		'styleMultiplicity': styleMultiplicity,

		'secondLine': secondLine,
		'labelAlign': labelAlign,
		'labelHeight': labelHeight,

		'barVisible': barVisible,
		//'barColor': barColor,
		'sidebarWidth': sidebarWidth,
		'sidebarHeight': sidebarHeight,

		'tickVisible': tickVisible,
		//'tickColor': tickColor,
		'sidetickWidth': sidetickWidth,
		'sidetickHeight': sidetickHeight,
		'sidetickLeftStart': sidetickLeftStart,

		'badge': badge,
		'badgeVisible': badgeVisible,
		'badgeColor': badgeColor,
		'badgeFontColor': badgeFontColor,
		'badgeText': badgeText,

		'lineColor': lineColor,
		'fillColor': fillColor,
		'fontColor': fontColor,
		'cornerColor': cornerColor,
		'styleColor': styleColor,

		'cornerVisible': cornerVisible,
		'iconColor': iconColor,

		'iconAreaWidth': iconAreaWidth,
		'cornerHeight': cornerHeight,

		'shapeWidth': details.shapeWidth,
		'shapeHeight': details.shapeHeight,
		'curveRadius': details.curveRadius,
		'shapeAlign': details.shapeAlign,
		'doubleOffset': details.doubleOffset,
		'multiplicityOffset': details.multiplicityOffset,
		'iconSize': details.iconSize,
		'iconAlign': details.iconAlign
	};
};

mxIBMShapeBase.prototype.getCellStyles2 = function(cellProps)
{
	let cellStyles = {};

	let props = cellProps.split(';');
	props = props.slice(0, -1); // Remove trailing semicolon.

	for (var index = 0; index < props.length; index++)
	{
		cell = props[index].split('=');
		if (cell[1] === 'null')
			cellStyles[cell[0]] = null;
		else	
			cellStyles[cell[0]] = cell[1];
	}

	return cellStyles;
}

mxIBMShapeBase.prototype.getCellLayout = function(value)
{
	let cellStyles = {};

	if (value === "collapsed")
		// Add collapsed text properties and remove expanded stack and container properties.
		cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.collapsedLabel + ibmConfig.ibmSystemProperties.expandedStackNull + ibmConfig.ibmSystemProperties.containerNull);
	else if (value === "expanded")
		// Add expanded text and container properties and remove expanded stack properties.
		cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.expandedLabel + ibmConfig.ibmSystemProperties.container + ibmConfig.ibmSystemProperties.expandedStackNull);
	else if (value === "expandedStack")
		// Add expanded text, expanded stack properties, and container properties.
		cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.expandedLabel + ibmConfig.ibmSystemProperties.expandedStack + ibmConfig.ibmSystemProperties.container);
	else if (value.startsWith("group"))
		// Add expanded text and container properties and remove expanded stack properties.
		cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.expandedLabel + ibmConfig.ibmSystemProperties.container + ibmConfig.ibmSystemProperties.expandedStackNull);
	else
		// Remove expanded stack and container properties.
		cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.expandedStackNull + ibmConfig.ibmSystemProperties.containerNull);
  
	return {cellStyles};
};

mxIBMShapeBase.prototype.setCellStyles2 = function(graph, change) 
{
	let stylesForCells = this.getCellLayout(change).cellStyles;  

	let selectedCells = graph.getSelectionCells();

	for (let key in stylesForCells) 
		graph.setCellStyles(key, stylesForCells[key], selectedCells);
};

mxIBMShapeBase.prototype.textSpacing = 4;

mxIBMShapeBase.prototype.textSpacingLeft = 16;

mxIBMShapeBase.prototype.init = function(container)
{
	if (!mxUtils.isNode(this.state.cell.value)) {
		let obj = mxUtils.createXmlDocument().createElement('UserObject');
		obj.setAttribute('label', this.state.cell.value);
		this.state.cell.value = obj;
	}
	//else {
	//	let obj = mxUtils.createXmlDocument().createElement('UserObject');
	//	obj.setAttribute('label', ibmConfig.ibmFontProperties.en);
	//	this.state.cell.value = obj;
	//}

	let ibmShapeAttributes = ['Badge-Text', 'Icon-Name', 'Primary-Label', 'Secondary-Text'];
	this.addMissingAttribute(this.state.cell, ibmShapeAttributes);

	mxShape.prototype.init.apply(this, arguments);

	this.cellID = this.state.cell.id;
	this.childCells = this.state.cell.children;
	this.handleEvents();
};

mxIBMShapeBase.prototype.addMissingAttribute = function(cell, keys)
{
	for (let key of keys) {
		if (!cell.hasAttribute(key)) {
			cell.setAttribute(key, '')
		}
	}
}

mxIBMShapeBase.prototype.handleEvents = function()
{
	function valueStatus(styleKv, key) {
		const current = mxIBMShapeBase.prototype.getStyleValue(styleKv.current, key);
		const previous = mxIBMShapeBase.prototype.getStyleValue(styleKv.previous, key);
		
		return { current, previous, isChanged: current !== previous };
	}

	if (this.eventHandler == null)
	{
		this.eventHandler = mxUtils.bind(this, function(sender, evt)
		{
			try
			{
				if (evt.properties.change.cell.id !== this.cellID)
					return;

				if (evt.properties.change.constructor.name === 'mxValueChange')
				{
					const checkAttrs = ['Icon-Name', 'Badge-Text'];
					const { current, previous } = { current: evt.properties.change.value.attributes, previous: evt.properties.change.previous.attributes };
					const needDraw = checkAttrs.some(it => (current.getNamedItem(it) && current.getNamedItem(it).value) !== (previous.getNamedItem(it) && previous.getNamedItem(it).value));
					if (needDraw)
						this.redraw();
				}
				else if (evt.properties.change.constructor.name === 'mxStyleChange')
				{
					const style = { current: evt.properties.change.style, previous: evt.properties.change.previous };
					const isIBMShape = (style.current.indexOf(mxIBMShapeBase.prototype.cst.SHAPE) > 0);

					if (isIBMShape)
					{
						const shapeType = valueStatus(style, mxIBMShapeBase.prototype.cst.SHAPE_TYPE);
						const hideIcon = valueStatus(style, mxIBMShapeBase.prototype.cst.HIDE_ICON);

						//const shapeLayoutValues = valueStatus(style, mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT);
						const shapeLayout = valueStatus(style, mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT);
						//const shapeCurrLayoutValues = mxIBMShapeBase.prototype.extractLayouts(shapeLayoutValues.current);
						//const shapePrevLayoutValues = mxIBMShapeBase.prototype.extractLayouts(shapeLayoutValues.previous);
						//const shapeLayout = { current: shapeCurrLayoutValues[0], previous: shapePrevLayoutValues[0], isChanged: shapeCurrLayoutValues[0] !== shapePrevLayoutValues[0]};
						//const shapeSubLayout = { current: shapeCurrLayoutValues[1], previous: shapePrevLayoutValues[1], isChanged: shapeCurrLayoutValues[1] !== shapePrevLayoutValues[1] };
	
						//var needApplyStyle = shapeType.isChanged || shapeLayout.isChanged || hideIcon.isChanged || shapeSubLayout.isChanged;
						var needApplyStyle = shapeType.isChanged || shapeLayout.isChanged || hideIcon.isChanged;

						if (needApplyStyle)
						{
							// Replaces onChange.
							//var currentLayout = shapeLayout.current + shapeSubLayout.current;
							//currentLayout = currentLayout.toLowerCase();
							var currentLayout = shapeLayout.current;
							//var previousLayout = shapeLayout.previous + shapeSubLayout.previous;
							//previousLayout = previousLayout.toLowerCase();
							var previousLayout = shapeLayout.previous;
							//changeExpanded = ((currentLayout == 'expanded' && previousLayout == 'expandedstack') || (currentLayout == 'expandedstack' && previousLayout == 'expanded') || (currentLayout.startsWith('expanded') && (previousLayout == 'collapsed' || previousLayout.startsWith('item'))));
							changeExpanded = ((currentLayout == 'expanded' && previousLayout == 'expandedStack') || 
									  (currentLayout == 'expandedStack' && previousLayout == 'expanded') || 
									  (currentLayout.startsWith('expanded') && (previousLayout == 'collapsed' || previousLayout.startsWith('item'))) || 
								          (currentLayout == 'collapsed' && previousLayout != 'collapsed'));
							var styleNew = style.current;
							var updatedStyle = mxIBMShapeBase.prototype.getStyle(styleNew, shapeType.current, shapeLayout.current, hideIcon.current, (changeExpanded ? currentLayout : null) );
							styleNew = updatedStyle.style;
							shapeLayout.current = updatedStyle.shapeLayout;
							needApplyStyle = style.current !== styleNew;

							if (shapeType.isChanged)
							{
								const needDraw = false;
								if (needDraw)
									this.redraw();
							}
						}
						
						var needApplyGeo = shapeType.isChanged || shapeLayout.isChanged;
						if (needApplyGeo)
						{
							const geoCurrent = evt.properties.change.cell.geometry;
							var newRect = mxIBMShapeBase.prototype.getRectangle(
								false,
								new mxRectangle(geoCurrent.x, geoCurrent.y, geoCurrent.width, geoCurrent.height), 
									shapeType.current, shapeLayout.current /*, shapeSubLayout.current*/);
					
							needApplyGeo = geoCurrent.width != newRect.width || geoCurrent.height != newRect.height;
						}
	
						if (needApplyStyle || needApplyGeo)
						{
							this.state.view.graph.model.beginUpdate();
							try
							{				
								if (needApplyStyle)
								{
									this.state.view.graph.model.setStyle(this.state.cell, styleNew);
								}
									
								if (needApplyGeo)
								{
									this.state.view.graph.model.setGeometry(this.state.cell, 
										new mxGeometry(newRect.x, newRect.y, newRect.width, newRect.height));
								}
							}
							finally
							{
								this.state.view.graph.model.endUpdate();
							}
						}
					}
				}
				else
				{   // do nothing
				   /* Disable for now due to moving shape increases height.
				   const Padding = 8;
				   if ( this.childCells != null ){
					for (let j = 0; j < this.childCells.length; j++){ 
						this.childCells[j].geometry.y = this.childCells[j].geometry.y + Padding * j
					}  
					geo = this.state.cell.geometry;
					geo.height = geo.height + (this.childCells.length - 1) * Padding;
				   }
				   */
				}
			}
			catch(err)
			{
				// do nothing
			}
		});

		this.state.view.graph.model.addListener(mxEvent.EXECUTED, this.eventHandler);
	}
}

mxIBMShapeBase.prototype.getStyleValue = function(style, key)
{
	var value = 'undefined';
	var keyIndex = style.indexOf(key);

	if (keyIndex > 0)
	{	
		var valueSeparator = style.indexOf('=', keyIndex + 1);
		var keySeparator = style.indexOf(';', valueSeparator + 1);

		if (keySeparator < 0)
			keySeparator = style.length;
		
		value = style.substring(valueSeparator + 1, keySeparator);
	}

	return value;
}

mxIBMShapeBase.prototype.redraw = function()
{
	this.shapeType = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.SHAPE_TYPE, mxIBMShapeBase.prototype.cst.SHAPE_TYPE_DEFAULT);	
	
	//let shapeLayoutValues = mxIBMShapeBase.prototype.extractLayouts(mxUtils.getValue(this.style,mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT, mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT_DEFAULT));
	//this.shapeLayout = shapeLayoutValues[0];
	//this.shapeSubLayout = shapeLayoutValues[1];
	this.shapeLayout = mxUtils.getValue(this.style,mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT, mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT_DEFAULT);

	this.styleDashed = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.STYLE_DASHED, mxIBMShapeBase.prototype.cst.STYLE_DASHED_DEFAULT);
	this.styleDouble = mxUtils.getValue(this.style,mxIBMShapeBase.prototype.cst.STYLE_DOUBLE,mxIBMShapeBase.prototype.cst.STYLE_DOUBLE_DEFAULT);
	this.styleStrikethrough = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.STYLE_STRIKETHROUGH, mxIBMShapeBase.prototype.cst.STYLE_STRIKETHROUGH_DEFAULT);
	this.styleMultiplicity = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.STYLE_MULTIPLICITY, mxIBMShapeBase.prototype.cst.STYLE_MULTIPLICITY_DEFAULT);

	//this.iconVisible = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.ICON_VISIBLE, mxIBMShapeBase.prototype.cst.ICON_VISIBLE_DEFAULT);
	this.hideIcon = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.HIDE_ICON, mxIBMShapeBase.prototype.cst.HIDE_ICON_DEFAULT);
	this.rotateIcon = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.ROTATE_ICON, mxIBMShapeBase.prototype.cst.ROTATE_ICON_DEFAULT);

	this.lineColor = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.LINE_COLOR, mxIBMShapeBase.prototype.cst.LINE_COLOR_DEFAULT);	
	this.fillColor = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.FILL_COLOR, mxIBMShapeBase.prototype.cst.FILL_COLOR_DEFAULT);	
	this.fontColor = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.FONT_COLOR, mxIBMShapeBase.prototype.cst.FONT_COLOR_DEFAULT);	

	/*
	if (this.fillColor != this.cst.FILL_COLOR_DEFAULT) {
		let normalizedColor = this.normalizeFillColor(this.fillColor, this.lineColor);
		styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
		newStyle = mxUtils.setStyle(styleCurrent, mxIBMShapeBase.prototype.cst.FILL_COLOR, normalizedColor);
		this.state.view.graph.model.setStyle(this.state.cell, newStyle);
		this.fillColor = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.FILL_COLOR, mxIBMShapeBase.prototype.cst.FILL_COLOR_DEFAULT);	
	}
	*/

	// labelPosition and verticalLabelPosition required here to change shape from collapsed to expanded.
	this.labelPosition = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.LABEL_POSITION, mxIBMShapeBase.prototype.cst.LABEL_POSITION_DEFAULT);
	this.verticalLabelPosition = mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.VERTICAL_LABEL_POSITION, mxIBMShapeBase.prototype.cst.VERTICAL_LABEL_POSITION_DEFAULT);

	mxShape.prototype.redraw.apply(this, arguments);
};

mxIBMShapeBase.prototype.paintVertexShape = function(c, x, y, w, h)
{
	//let pop = this.shapeProperties = mxIBMShapeBase.prototype.getProperties(this, w, h);
	this.shapeProperties = mxIBMShapeBase.prototype.getProperties(this, w, h);
	console.log("shapeProperties:");
	console.log(this.shapeProperties);

	c.translate(x, y);

	this.paintShape(c);
	this.paintCorner(c);
	this.paintIcon(c);
	this.paintShapeDecoration(c);
	this.paintStrikethrough(c);
	this.paintBadge(c);

	//this.style.fontColor = pop.fontColor;
	this.style.fontColor = this.shapeProperties.fontColor;
	styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
	newStyle = mxUtils.setStyle(styleCurrent, 'fontColor', this.style.fontColor);
	this.state.view.graph.model.setStyle(this.state.cell, newStyle);

	//if (!mxUtils.isNode(this.state.cell.value)) {
	//let obj = mxUtils.createXmlDocument().createElement('UserObject');
	//obj.setAttribute('label', ibmConfig.ibmFontProperties.en);
	//obj.setAttribute('label', this.state.cell.value);
	//this.state.cell.value = obj;
	//}

	//this.style.fontColor = pop.fontColor;
	//styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
	//newStyle = mxUtils.setStyle(styleCurrent, 'fontColor', this.style.fontColor);
	//this.state.view.graph.model.setStyle(this.state.cell, newStyle);
};

mxIBMShapeBase.prototype.paintActor = function(c, width, offSet = 0)
{
	c.ellipse(offSet, offSet, width-offSet*2, width-offSet*2); 
}

mxIBMShapeBase.prototype.paintTargetSystem = function(c, width, height, radius, offset = 0, leftShift = 20)
{
	c.begin();
	c.moveTo(radius + leftShift, offset);
	c.arcTo(radius - offset, radius - offset, 0, 0, 0, radius + leftShift, height - offset);
	c.lineTo(width - radius + leftShift, height - offset);
	c.arcTo(radius - offset, radius - offset, 0, 0, 0, width - radius + leftShift, offset);
	c.close();
}

mxIBMShapeBase.prototype.paintLogicalGroup = function(c, width, height, radius, offset = 0)
{
	c.begin();
	c.moveTo(offset, offset);
	c.lineTo(offset, height - radius);
	c.arcTo(radius - offset, radius - offset, 0, 0, 0, radius, height - offset);
	c.lineTo(width - radius, height - offset);
	c.arcTo(radius - offset, radius - offset, 0, 0, 0, width - offset, height - radius);
	c.lineTo(width - offset, radius);
	c.arcTo(radius - offset, radius - offset, 0, 0, 0, width - radius, offset);
	c.close();
}

mxIBMShapeBase.prototype.paintRoundedRectangle = function(c, width, height, radius, offSet = 0)
{
	c.roundrect(offSet, offSet, width - offSet*2, height - offSet*2, radius - offSet, radius - offSet);
}

mxIBMShapeBase.prototype.paintRectangle = function(c, width, height, offSet = 0)
{
	c.rect(offSet, offSet, width - offSet*2, height - offSet*2);
}

mxIBMShapeBase.prototype.paintCorner = function(c)
{
	let pop = this.shapeProperties;

	if (pop.cornerVisible)
	{
		const doubleStyleOffset = (pop.secondLine) ? pop.doubleOffset : 0;
		c.setFillColor(pop.cornerColor);

		if (pop.shapeType === 'actor')
		{
			mxIBMShapeBase.prototype.paintActor(c, pop.shapeWidth, doubleStyleOffset);
		}
		//else if (pop.shapeType === 'ts')
		else if (pop.shapeType === 'target')
		{
			mxIBMShapeBase.prototype.paintTargetSystem(c, pop.shapeWidth, pop.cornerHeight, pop.curveRadius, doubleStyleOffset, pop.shapeAlign);
		}
		//else if (pop.shapeType === 'ln' || pop.shapeType === 'lc')
		else if (pop.shapeType === 'nodel' || pop.shapeType === 'compl')
		{
			if (pop.shapeLayout === 'collapsed' || pop.shapeLayout.startsWith('item'))
			{
				mxIBMShapeBase.prototype.paintRoundedRectangle(c, pop.shapeWidth, pop.shapeHeight, pop.curveRadius, doubleStyleOffset);
			}
			else
			{
				c.begin();
				c.moveTo(pop.curveRadius, 0);
				c.lineTo(pop.iconAreaWidth, 0);
				c.lineTo(pop.iconAreaWidth, pop.cornerHeight);
				if (pop.sidebarHeight < pop.shapeHeight)
				{
					c.lineTo(0, pop.cornerHeight);
				}
				else
				{
					c.lineTo(pop.curveRadius, pop.cornerHeight);
					c.arcTo(pop.curveRadius, pop.curveRadius, 0, 0, 1, 0, pop.cornerHeight - pop.curveRadius);
				}
				c.lineTo(0, pop.curveRadius);	
				c.arcTo(pop.curveRadius, pop.curveRadius, 0, 0, 1, pop.curveRadius, 0);
				c.close();
			}
		}
		else
		{
			mxIBMShapeBase.prototype.paintRectangle(c, pop.iconAreaWidth, pop.cornerHeight, doubleStyleOffset);
		}
		
		c.fill();
	}
};

mxIBMShapeBase.prototype.paintShape = function(c)
{
	let pop = this.shapeProperties;

	//if (pop.shapeType === 'ln' || pop.shapeType === 'lc')
	if (pop.shapeType.slice(-1) === 'l')
	{
		if (pop.sidebarHeight < pop.shapeHeight)
		{
			c.begin();
			c.moveTo(pop.curveRadius, 0);
			c.lineTo(pop.shapeWidth - pop.curveRadius, 0);
			c.arcTo(pop.curveRadius, pop.curveRadius, 0, 0, 1, pop.shapeWidth, pop.curveRadius);
			c.lineTo(pop.shapeWidth, pop.labelHeight);
			c.lineTo(0, pop.labelHeight);
			c.lineTo(0, pop.curveRadius);
			c.arcTo(pop.curveRadius, pop.curveRadius, 0, 0, 1, pop.curveRadius, 0);
			c.close();
			c.fill();
		}
		else
		{
			// c.setFillColor(color);
			c.roundrect(0, 0, pop.shapeWidth, pop.labelHeight, pop.curveRadius, pop.curveRadius);
			c.fill();
		}
	}
	//else if (pop.shapeType === 'lg')
	else if (pop.shapeType === 'groupl')
	{
		c.begin();
		c.moveTo(0, 0);
		c.lineTo(pop.shapeWidth - pop.curveRadius, 0);
		c.arcTo(pop.curveRadius, pop.curveRadius, 0, 0, 1, pop.shapeWidth, pop.curveRadius);
		c.lineTo(pop.shapeWidth, pop.labelHeight);
		c.lineTo(0, pop.labelHeight);
		c.lineTo(0, 0);
		c.close();
		c.fill();
	}
	else
	{
		c.rect(0, 0, pop.shapeWidth, pop.labelHeight);
		c.fill();
	}

	if (pop.shapeVisible) {
		c.setFillColor(pop.fillColor);
		c.setStrokeColor(pop.lineColor);

		c.save();
		if (pop.styleDashed) {
			c.setDashed(true, true);
			c.setDashPattern(this.style.dashPattern ? this.style.dashPattern : '6 6');
		}

		this.paintShapeOutline(c, 0);
		c.fillAndStroke();
		this.paintShapeMultiplicity(c);
		this.paintShapeStyle(c);

		c.restore();
	}
};

mxIBMShapeBase.prototype.paintShapeStyle = function(c)
{
	let pop = this.shapeProperties;

	if (pop.secondLine) {
		const doubleStyleOffset = pop.doubleOffset;

		c.save();
		c.setDashed(false, false);

		c.setStrokeWidth(doubleStyleOffset);
		c.setStrokeColor(ibmConfig.ibmColors.white);

		this.paintShapeOutline(c, doubleStyleOffset / 2);

		c.stroke();

		c.setStrokeWidth(1);
		c.setStrokeColor(pop.lineColor);

		this.paintShapeOutline(c, doubleStyleOffset);

		c.stroke();
		c.restore();
	}

	if (pop.dividerVisible) {
		c.save();
		c.setStrokeColor(pop.dividerColor);
		c.setDashed(false);
		c.setStrokeWidth(1);
		c.begin();
		c.moveTo(0, pop.labelHeight);
		c.lineTo(pop.shapeWidth, pop.labelHeight);
		c.stroke();
		c.restore();
	}
}

mxIBMShapeBase.prototype.paintShapeOutline = function(c, doubleStyleOffset)
{
	let pop = this.shapeProperties;

	if (pop.shapeType === 'actor')
		mxIBMShapeBase.prototype.paintActor(c, pop.shapeWidth, doubleStyleOffset);
	//else if (pop.shapeType === 'ts')
	else if (pop.shapeType === 'target')
		mxIBMShapeBase.prototype.paintTargetSystem(c, pop.shapeWidth, pop.shapeHeight, pop.curveRadius, doubleStyleOffset, pop.shapeAlign);
	//else if (pop.shapeType === 'ln' || pop.shapeType === 'lc')
	else if (pop.shapeType.slice(-1)  === 'l')
		mxIBMShapeBase.prototype.paintRoundedRectangle(c, pop.shapeWidth, pop.shapeHeight, pop.curveRadius, doubleStyleOffset);
	//else if (pop.shapeType === 'lg')
	else if (pop.shapeType === 'groupl')
		mxIBMShapeBase.prototype.paintLogicalGroup(c, pop.shapeWidth, pop.shapeHeight, pop.curveRadius, doubleStyleOffset);
	else
		mxIBMShapeBase.prototype.paintRectangle(c, pop.shapeWidth, pop.shapeHeight, doubleStyleOffset);
}

mxIBMShapeBase.prototype.paintStrikethrough = function(c)
{
	function getCornerX(angle, r) {
		return r + r * Math.cos(angle * (Math.PI / 180));
	}

	function getCornerY(angle, r) {
		return r - r * Math.sin(angle * (Math.PI / 180));
	}

	let pop = this.shapeProperties;

	if (pop.styleStrikethrough) {
		let leftCornerX = (pop.shapeLayout.startsWith('expanded')) ? pop.iconAreaWidth : 0;
		let leftCornerY = 0;
		let rightCornerX = pop.shapeWidth;
		let rightCornerY = (pop.shapeLayout.startsWith('expanded')) ? pop.labelHeight : pop.shapeHeight;

		c.setStrokeColor(pop.styleColor);
		c.begin();

		if (pop.shapeType === 'actor') {
			let r = pop.curveRadius;
			let angle = 135;

			leftCornerX = getCornerX(angle, r);
			leftCornerY = getCornerY(angle, r);

			angle = 315;
			rightCornerX = getCornerX(angle, r);
			rightCornerY = getCornerY(angle, r);
		}
		//else if (pop.shapeType === 'ts') {
		else if (pop.shapeType === 'target') {
			if (pop.shapeLayout === 'collapsed' || pop.shapeLayout.startsWith('item')) {
				let r = pop.curveRadius;
				let angle = 125;

				leftCornerX = pop.shapeAlign + getCornerX(angle, r);
				leftCornerY = getCornerY(angle, r);

				let h = (pop.shapeLayout === 'collapsed') ? 16 : 0;
				angle = 305;
				rightCornerX = h + pop.shapeAlign + getCornerX(angle, r);
				rightCornerY = getCornerY(angle, r);
			}
			else {
				leftCornerX = pop.curveRadius;
				rightCornerX = rightCornerX - pop.curveRadius;
			}

		}
		//else if (-1 !== ['ln', 'lc', 'lg'].indexOf(pop.shapeType)) {
		else if (pop.shapeType.slice(-1) === 'l') {
			let r = pop.curveRadius;
			let angle = 135;

			if (pop.shapeType.startsWith('group')) {
				leftCornerX = pop.sidebarWidth;
				rightCornerY = pop.shapeHeight;
			}
			else if (pop.shapeLayout.startsWith('expanded') && pop.cornerVisible) {
			}
			else {
				leftCornerX = getCornerX(angle, r);
				leftCornerY = getCornerY(angle, r);
			}

			if (pop.dividerVisible) {
			}
			else {
				let h = (pop.shapeLayout.startsWith('expanded') || pop.shapeLayout === 'collapsed') ? rightCornerX - r - 8 : 12;
				let k = (pop.shapeLayout.startsWith('expanded') || pop.shapeLayout === 'collapsed') ? rightCornerY - r - 8 : 12;

				angle = 315;
				rightCornerX = h + getCornerX(angle, r);
				rightCornerY = k + getCornerY(angle, r);
			}
		}
		else if (pop.shapeType === 'groupp') {
			leftCornerX = pop.sidebarWidth;
			rightCornerY = pop.shapeHeight;
		}

		c.moveTo(leftCornerX, leftCornerY);
		c.lineTo(rightCornerX, rightCornerY);
		c.stroke();
	}
}

mxIBMShapeBase.prototype.paintShapeDecoration = function(c)
{
	let pop = this.shapeProperties;

	// Component decorator
	if (pop.tickVisible) {
		c.save();
		c.setDashed(false);
		c.setFillColor(ibmConfig.ibmColors.white);
		c.rect(pop.sidetickLeftStart, Math.floor(pop.cornerHeight / 4), pop.sidetickWidth, pop.sidetickHeight);
		c.fillAndStroke();
		c.rect(pop.sidetickLeftStart, Math.floor((pop.cornerHeight / 3) * 2), pop.sidetickWidth, pop.sidetickHeight);
		c.fillAndStroke();
		c.restore();
	}

	// Bar decorator
	if (pop.barVisible) {
		c.setFillColor(pop.lineColor);
		c.rect(0, 0, pop.sidebarWidth, pop.sidebarHeight);
		c.fillAndStroke();
	}
}

mxIBMShapeBase.prototype.paintBadge = function(c)
{
	let pop = this.shapeProperties;

	if (pop.badgeVisible) {
		let fontSize = 12;
		let characterWidth = (6/10) * fontSize;

		let badgeText = pop.badgeText;
		let textLength = (badgeText != null) ? badgeText.length : 0;
		let extraTextWidth = (textLength > 1) ? characterWidth * (textLength - 1) + 4 : 0;
		let badgeCenter = (pop.shapeLayout === 'collapsed' || pop.shapeLayout.startsWith('expanded')) ? 0 : pop.shapeHeight/2;

		let badgeHeight = 14;
		let badgeWidth = badgeHeight + extraTextWidth;
		let topBadgeY = -1 * badgeHeight/2 + badgeCenter;

		let textPositionY = badgeCenter - 1;
		
		let rightBadgeX = 0;

		//let badgeOffset = (pop.shapeType === 'actor' || pop.shapeType === 'ts') ? -8 : 0;
		let badgeOffset = (pop.shapeType === 'actor' || pop.shapeType === 'target') ? -8 : 0;
		const badgeSpaceRight = -1 * badgeHeight / 2 - badgeOffset;
		if (pop.shapeLayout.startsWith('item')) {
			rightBadgeX = badgeWidth;
			pop.labelAlign = 15 + extraTextWidth + 8;
		}
		else
			rightBadgeX = pop.shapeWidth - badgeSpaceRight;

		let leftBadgeX = rightBadgeX - badgeWidth;
		let centerBadgeX = (rightBadgeX + leftBadgeX)/2;

		c.setFillColor(pop.badgeColor);
		c.setStrokeColor(pop.badgeColor);
		c.setDashed(false);
		c.setStrokeWidth(1);

		let badgeVisualSpecs = [
			{offSet: -1, fillColor: ibmConfig.ibmColors.white, strokeColor: ibmConfig.ibmColors.white, lineJoin: 'bevel'},
			{offSet: 0, fillColor: pop.badgeColor, strokeColor: pop.badgeColor, lineJoin: 'miter'}];

		for (let idx = 0; idx < badgeVisualSpecs.length; idx++)
		{
			c.setStrokeColor(badgeVisualSpecs[idx].strokeColor);
			c.setFillColor(badgeVisualSpecs[idx].fillColor);
			c.setLineJoin(badgeVisualSpecs[idx].lineJoin);
			let lineOffset = badgeVisualSpecs[idx].offSet;

			this.paintSimpleShape(c, pop.badge, leftBadgeX, topBadgeY, badgeWidth, badgeHeight, lineOffset);
			c.fillAndStroke();					
		}		

		if (badgeText != null)
		{
			c.setFontColor(pop.badgeFontColor);
			c.setFontSize(fontSize);
			c.setFontFamily(ibmConfig.ibmFonts[ibmLanguage].regular);
			c.text(centerBadgeX, textPositionY, 0, 14, badgeText, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);	
		}
	}
}

mxIBMShapeBase.prototype.paintSimpleShape = function(c, shape, x, y, w, h, offset) {
	let r = 7;
	let shapeActions = {
		circle: { operators: ['move', 'line', 'arc', 'line', 'arc'], positions: [[x + r, y + offset], [x + w - r, y + offset], [x + w - r, y + h - offset], [x + r, y + h - offset], [x + r, y + offset]] },
		diamond: { operators: ['move', 'line', 'line', 'line', 'line', 'line'], positions: [[x + r, y + offset], [x + w - r, y + offset], [x + w - offset, y + r], [x + w - r, y + h - offset], [x + r, y + h - offset], [x + offset, y + r]] },
		square: { operators: ['move', 'line', 'line', 'line', 'line'], positions: [[x + offset, y + offset], [x + w - offset, y + offset], [x + w - offset, y + h - offset], [x + offset, y + h - offset], [x + offset, y + offset]] },
		triangle: { operators: ['move', 'line', 'line', 'line', 'line'], positions: [[x + r, y + offset], [x + w - offset - r, y + offset], [x + w - 2 * offset, y + h - offset], [x + 2 * offset, y + h - offset], [x + offset + r, y + offset]] },
		hexagon: { operators: ['move', 'line', 'line', 'line', 'line', 'line', 'line'], positions: [[x + r / 2, y + offset], [x + w - offset / 2 - r / 2, y + offset], [x + w - offset, y + r], [x + w - offset / 2 - r / 2, y + h - offset], [x + offset / 2 + r / 2, y + h - offset], [x + offset, y + r], [x + offset / 2 + r / 2, y + offset]] },
		octagon: { operators: ['move', 'line', 'line', 'line', 'line', 'line', 'line', 'line', 'line'], positions: [[x + offset / 2 + r / 2, y + offset], [x + w - offset / 2 - r / 2, y + offset], [x + w - offset, y + offset / 2 + r / 2], [x + w - offset, y + h - offset / 2 - r / 2], [x + w - offset / 2 - r / 2, y + h - offset], [x + offset / 2 + r / 2, y + h - offset], [x + offset, y + h - offset / 2 - r / 2], [x + offset, y + offset / 2 + r / 2], [x + offset / 2 + r / 2, y + offset]] }
	}

	let action = shapeActions[shape];
	if (action) {
		c.begin();
		for (let i in action.operators) {
			let positions = action.positions[i];
			if (action.operators[i] === 'move') {
				c.moveTo(positions[0], positions[1]);
			}
			else if (action.operators[i] === 'line') {
				c.lineTo(positions[0], positions[1]);
			}
			else if (action.operators[i] === 'arc') {
				c.arcTo(1, 1, 0, 0, 1, positions[0], positions[1]);
			}
		}
		c.close();
	}
}

mxIBMShapeBase.prototype.paintShapeMultiplicity = function(c) {
	let pop = this.shapeProperties;

	if (pop.styleMultiplicity) {
		let { width, height, radius, space, offset } = { width: pop.shapeWidth, height: pop.shapeHeight, space: pop.multiplicityOffset, radius: pop.curveRadius, offset: pop.shapeAlign };
		let numbers = [1, 2];

		c.begin();
		for (let idx = 0; idx < numbers.length; idx++) {
			//if (-1 !== ['ln', 'lc', 'lg'].indexOf(pop.shapeType)) {
			if (pop.shapeType.slice(-1) === 'l') {
				c.moveTo((numbers[idx] + 1) * space, -numbers[idx] * space);
				c.lineTo(width + numbers[idx] * space - radius, -numbers[idx] * space);
				c.arcTo(radius, radius, 0, 0, 1, width + numbers[idx] * space, radius - numbers[idx] * space);
				c.lineTo(width + numbers[idx] * space, height - (numbers[idx] + 1) * space);
			}
			else if (pop.shapeType === 'actor') {
				c.moveTo(width / 2 + numbers[idx] * space, -numbers[idx] * space);
				c.arcTo(radius, radius, 0, 0, 1, width + numbers[idx] * space, height / 2 - numbers[idx] * space);
			}
			//else if (pop.shapeType === 'ts') {
			else if (pop.shapeType === 'target') {
				c.moveTo(radius + offset + (numbers[idx] - 1) * space, -numbers[idx] * space);
				c.lineTo(width + offset - radius + numbers[idx] * space, -numbers[idx] * space);
				c.arcTo(radius, radius, 0, 0, 1, width + offset + numbers[idx] * space, height / 2 - numbers[idx] * space);
			}
			else {
				c.moveTo((numbers[idx] + 1) * space, -numbers[idx] * space);
				c.lineTo(width + numbers[idx] * space, -numbers[idx] * space);
				c.lineTo(width + numbers[idx] * space, height - (numbers[idx] + 1) * space);
			}
		}
		c.stroke();
	}
}

mxIBMShapeBase.prototype.paintIcon = function(c)
{
	let pop = this.shapeProperties;

	if (!pop.hideIcon)
	{
		//let positionX = (pop.shapeType === 'lg' || pop.shapeType  === 'pg') ? pop.iconAreaWidth - pop.iconSize : pop.iconAreaWidth/2 - pop.iconSize/2;
		let positionX = pop.shapeType.startsWith('group') ? pop.iconAreaWidth - pop.iconSize : pop.iconAreaWidth/2 - pop.iconSize/2;
		//positionX = (pop.shapeLayout === 'expanded' && pop.shapeType  === 'ts') ? positionX + pop.curveRadius/2 : positionX;
		positionX = (pop.shapeLayout.startsWith('expanded') && pop.shapeType  === 'target') ? positionX + pop.curveRadius/2 : positionX;
		positionX = (pop.shapeLayout.startsWith('item')) ? 0 : positionX;
		
		let positionY = pop.cornerHeight/2 - pop.iconSize/2;

		let iconStencilName = this.state.cell.getAttribute('Icon-Name',null) || 'undefined';

		let iconStencil = mxStencilRegistry.getStencil('mxgraph.ibm.' + iconStencilName);

		if (iconStencil == null)
			iconStencil = mxStencilRegistry.getStencil('mxgraph.ibm.undefined');

		if (iconStencil != null)
		{
			c.save();
			let canvasCenterX = positionX + pop.iconSize/2;
			let canvasCenterY = pop.cornerHeight/2;
		
			c.rotate(pop.rotateIcon, false, false, canvasCenterX, canvasCenterY);
			
			c.setStrokeColor('none');
			c.setFillColor(pop.iconColor);
			c.setDashed(false);
	
			iconStencil.strokewidth = 1;
			iconStencil.drawShape(c, this, positionX, positionY, pop.iconSize, pop.iconSize);	
			
			c.restore();
		}
	}
};

var shapeStyle = {};
mxIBMShapeBase.prototype.getStyle = function(style, shapeType, shapeLayout, /*@SAVE positionText,*/ hideIcon, changeExpanded)
{	
	if (changeExpanded != null)
	{
		let stylesForCells = this.getCellLayout(changeExpanded).cellStyles;  

		for (let key in stylesForCells) 
			style = mxUtils.setStyle(style, key, stylesForCells[key]);
	}

	//if (shapeType === 'pg' || shapeType === 'lg')
	if (shapeType.startsWith('group'))
	{
		//style = mxUtils.setStyle(style, 'container', 1);
		//style = mxUtils.setStyle(style, 'collapsible', 0);
		//style = mxUtils.setStyle(style, 'recursiveResize', 0);
		//style = mxUtils.setStyle(style, 'expand', 0);

		if (shapeLayout === 'collapsed')
		{
			shapeLayout = 'expanded';
			style = mxUtils.setStyle(style, 'ibmLayout', shapeLayout);
		}	
	}
	else if (shapeType === 'actor')
	{
		if (shapeLayout.startsWith('expanded'))
		{
			shapeLayout = 'collapsed';
			style = mxUtils.setStyle(style, 'ibmLayout', shapeLayout);
		}	
	}

	//if (shapeLayout === 'collapsed'|| shapeLayout === 'item')
	//{
	//	style = mxUtils.setStyle(style, 'container', 0);
	//}

	if (shapeLayout === 'collapsed')
	{
		//shapeStyle.verticalLabelPosition = mxConstants.ALIGN_BOTTOM;
		//shapeStyle.labelPosition = mxConstants.ALIGN_CENTER;
		//shapeStyle.verticalAlign = mxConstants.ALIGN_TOP;
		//shapeStyle.align = mxConstants.ALIGN_CENTER;
		//shapeStyle.spacing = 0;
		//shapeStyle.spacingLeft = this.textSpacingLeft;
		//shapeStyle.spacingRight = this.textSpacingLeft;
		//shapeStyle.spacingTop = 0;
		//shapeStyle.spacingBottom = this.textSpacing;

		// Default label to bottom which can be repositioned by user.
		let cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.collapsedLabel);

		for (let key in cellStyles) 
			style = mxUtils.setStyle(style, key, cellStyles[key]);
	}
	else if (shapeLayout.startsWith('expanded'))
	{
		//let spacingLeft = (shapeLayout === 'expanded') ? this.textSpacingLeft : 0;
		//let spacingRight = (shapeLayout === 'expanded' && shapeType === 'target' && hideIcon) ? 16 : spacingLeft;
		//let align = (shapeLayout === 'expanded' && shapeType === 'target' && hideIcon) ? mxConstants.ALIGN_CENTER : mxConstants.ALIGN_LEFT;

		//shapeStyle.verticalLabelPosition = mxConstants.ALIGN_MIDDLE;
		//shapeStyle.labelPosition = mxConstants.ALIGN_CENTER;
		//shapeStyle.verticalAlign = mxConstants.ALIGN_MIDDLE;
		//shapeStyle.align = align;
		//shapeStyle.spacingLeft = spacingLeft;
		//shapeStyle.spacingRight = spacingRight;			
		//shapeStyle.spacing = 0;
		//shapeStyle.spacingTop = 0;
		//shapeStyle.spacingBottom = 0;
		//style = mxUtils.setStyle(style, mxConstants.STYLE_LABEL_WIDTH, null); // remove the label width since this is controlled by the bounding box
		
		let cellStyles = {};

		if (shapeType === 'target')
		{
			if (hideIcon) 
				cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.expandedTargetLabelNoIcon);
			else
				cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.expandedTargetLabel);
		}
		else
			cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.expandedLabel);

		for (let key in cellStyles) 
			style = mxUtils.setStyle(style, key, cellStyles[key]);
	}
	else if (shapeLayout.startsWith('item'))
	{
		let cellStyles = this.getCellStyles2(ibmConfig.ibmSystemProperties.itemLabel);

		for (let key in cellStyles) 
			style = mxUtils.setStyle(style, key, cellStyles[key]);
	}

	//style = mxUtils.setStyle(style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, shapeStyle.verticalLabelPosition);
	//style = mxUtils.setStyle(style, mxConstants.STYLE_LABEL_POSITION, shapeStyle.labelPosition);
	//style = mxUtils.setStyle(style, mxConstants.STYLE_VERTICAL_ALIGN, shapeStyle.verticalAlign);
	//style = mxUtils.setStyle(style, mxConstants.STYLE_ALIGN, shapeStyle.align);

	//style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING, shapeStyle.spacing);
	//style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING_LEFT, shapeStyle.spacingLeft);
	//style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING_RIGHT, shapeStyle.spacingRight);
	//style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING_TOP, shapeStyle.spacingTop);
	//style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING_BOTTOM, shapeStyle.spacingBottom);

	return {style, shapeLayout};
}

mxIBMShapeBase.prototype.getRectangle = function(usingMinSize, rect, shapeType, shapeLayout /*, shapeSubLayout*/)
{
	if (shapeType != null)
	{
		let details = this.getDetails(null, shapeType, shapeLayout, rect.width, rect.height);
		rect.width = Math.max(details.minWidth, rect.width);
		let height = details.minHeight;

		if (shapeLayout === 'collapsed')
		{
			rect.width = details.minWidth;
		}
		else if (shapeLayout.startsWith('expanded'))
		{
			rect.width = Math.max(usingMinSize ? details.minWidth : details.defaultWidth, rect.width);
			//height = shapeType === 'ts' ? details.minHeight : Math.max(details.minHeight, rect.height);
			height = shapeType === 'target' ? details.minHeight : Math.max(details.minHeight, rect.height);
		}

		rect.height = height;
	}

	return rect;
};

mxIBMShapeBase.prototype.getLabelBounds = function(rect)
{
	let pop = this.shapeProperties;

	return new mxRectangle(rect.x + pop.labelAlign * this.scale, 
				rect.y, rect.width - (pop.labelAlign * this.scale),
				pop.labelHeight * this.scale);
};

mxIBMShapeBase.prototype.getConstraints = function(style, w, h)
{
	let pop = this.shapeProperties;

	if (pop.shapeLayout.startsWith('item'))
		return null;

	var constr = [];

	if (pop.shapeType === 'actor')
	{
		var step = 30;
		var h = 0.5;
		var k = 0.5;
		var r = 0.5;
		for (var angle=0;  angle < 360;  angle+=step)
		{ 
			var x = h + r*Math.cos(angle * (Math.PI/180));
			var y = k - r*Math.sin(angle * (Math.PI/180));
			constr.push(new mxConnectionConstraint(new mxPoint(x,y), false));
		}
	}
	else
	{
		const connectionPositions = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
		//const dXoffSet = (pop.shapeType != 'ts' && pop.styleMultiplicity) ? 8 : 0;
		//const dYoffSet = (pop.shapeType != 'ts' && pop.styleMultiplicity) ? 8 : 0;
		const dXoffSet = (pop.shapeType != 'target' && pop.styleMultiplicity) ? 8 : 0;
		const dYoffSet = (pop.shapeType != 'target' && pop.styleMultiplicity) ? 8 : 0;
		
		var connectionConstraint = null;
		for (pointIndex = 0; pointIndex < connectionPositions.length; pointIndex++) {
			connectionConstraint = new mxConnectionConstraint(new mxPoint(0, connectionPositions[pointIndex]), false);
			constr.push(connectionConstraint);	
		}

		for (pointIndex = 0; pointIndex < connectionPositions.length; pointIndex++) {
			connectionConstraint = new mxConnectionConstraint(new mxPoint(1, connectionPositions[pointIndex]), false);
			connectionConstraint.dx = dXoffSet;
			constr.push(connectionConstraint);	
		}

		for (pointIndex = 0; pointIndex < connectionPositions.length; pointIndex++) {
			connectionConstraint = new mxConnectionConstraint(new mxPoint(connectionPositions[pointIndex], 0), false);
			connectionConstraint.dy = -1 * dYoffSet;
			constr.push(connectionConstraint);	
		}

		for (pointIndex = 0; pointIndex < connectionPositions.length; pointIndex++) {
			connectionConstraint = new mxConnectionConstraint(new mxPoint(connectionPositions[pointIndex], 1), false);
			constr.push(connectionConstraint);	
		}

	}

	return (constr);
}

mxIBMShapeBase.prototype.destroy = function()
{
	mxShape.prototype.destroy.apply(this, arguments);

	if (this.eventHandler != null)
	{
		this.state.view.graph.model.removeListener(this.eventHandler);
		this.eventHandler = null;
	}
}

let _union = mxVertexHandler.prototype.union;
mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr, constrained)
{  	
	let rect = _union.apply(this, arguments);

	if (this.state.style['shape'] === mxIBMShapeBase.prototype.cst.SHAPE)
	{
		const shapeType = mxUtils.getValue(this.state.style, mxIBMShapeBase.prototype.cst.SHAPE_TYPE, mxIBMShapeBase.prototype.cst.SHAPE_TYPE_DEFAULT);
		//var shapeLayoutValues = mxIBMShapeBase.prototype.extractLayouts(mxUtils.getValue(this.state.style, mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT, mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT_DEFAULT));
		//const shapeLayout = shapeLayoutValues[0];
		//const shapeSubLayout = shapeLayoutValues[1];
		const shapeLayout = mxUtils.getValue(this.state.style, mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT, mxIBMShapeBase.prototype.cst.SHAPE_LAYOUT_DEFAULT);
		rect = mxIBMShapeBase.prototype.getRectangle(true, rect, shapeType, shapeLayout /*, shapeSubLayout*/);
	}

	return rect;
};




//**********************************************************************************************************************************************************
// Legends
//**********************************************************************************************************************************************************

function mxIBMShapeLegend(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

mxUtils.extend(mxIBMShapeLegend, mxShape);

mxIBMShapeLegend.legendPadding = 8;
mxIBMShapeLegend.legendItemHeight = 16;
mxIBMShapeLegend.legendTitlebar = 32;

mxIBMShapeLegend.prototype.cst = ibmConfig.ibmLegendConstants; 

// Replace below  with the following but not working yet.
//mxIBMShapeLegend.prototype.customProperties = ibmConfig.ibmLegendProperties;

mxIBMShapeLegend.prototype.customProperties = [
	{name: 'ibmType', dispName: 'Type', type: 'enum', defVal: 'legendv', enumList: 
		[{val: "legendh", dispName: "Horizontal"},
		{val: "legendv", dispName: "Vertical"}],
		onChange: function(graph, change) { mxIBMShapeLegend.prototype.setCellStyles(graph, change); } },
	{name: 'ibmNoHeader', dispName: 'Hide Header', type: 'bool', defVal: 'false',
		onChange: function(graph, change) { mxIBMShapeLegend.prototype.setCellStylesHeader(graph, change); } },
];

mxIBMShapeLegend.prototype.handleEvents = function()
{
	function valueStatus(styleKv, key) {
		const current = mxIBMShapeBase.prototype.getStyleValue(styleKv.current, key);
		const previous = mxIBMShapeBase.prototype.getStyleValue(styleKv.previous, key);
		
		return { current, previous, isChanged: current !== previous };
	}

	if (this.eventHandler == null)
	{
		this.eventHandler = mxUtils.bind(this, function(sender, evt)
		{
			try
			{
				if (evt.properties.change.cell.id !== this.cellID)
					return;

				if (evt.properties.change.constructor.name === 'mxStyleChange')
				{
					const style = { current: evt.properties.change.style, previous: evt.properties.change.previous };
					const isIBMShape = (style.current.indexOf(mxIBMShapeLegend.prototype.cst.SHAPE) > 0);

					if (isIBMShape)
					{
						const shapeType = valueStatus(style, mxIBMShapeBase.prototype.cst.SHAPE_TYPE);
	
						var needApplyStyle = shapeType.isChanged;

						if (needApplyStyle)
						{
							// Replaces onChange.
							var styleNew = style.current;
							//var updatedStyle = mxIBMShapeLegend.prototype.getStyle(styleNew, shapeType.current);
							var updatedStyle = this.getStyle(styleNew, shapeType.current);
							styleNew = updatedStyle.style;
							shapeLayout.current = updatedStyle.shapeLayout;
						
							this.state.view.graph.model.beginUpdate();
							try
							{				
								if (needApplyStyle)
								{
									this.state.view.graph.model.setStyle(this.state.cell, styleNew);
								}
							}
							finally
							{
								this.state.view.graph.model.endUpdate();
							}
						}
					}
				}
				else
				{   
					// do nothing
				}
			}
			catch(err)
			{
				// do nothing
			}
		});

		this.state.view.graph.model.addListener(mxEvent.EXECUTED, this.eventHandler);
	}
}

mxIBMShapeLegend.prototype.destroy = function()
{
	mxShape.prototype.destroy.apply(this, arguments);

	if (this.eventHandler != null)
	{
		this.state.view.graph.model.removeListener(this.eventHandler);
		this.eventHandler = null;
	}
}

mxIBMShapeLegend.prototype.getCellLayout = function(value)
{
	//let isHorizontal = ['legendh', 'legendht'].includes(value);
	let isHorizontal = (value === 'legendh');
	//let showTitle = [ 'legendvt', 'legendht'].includes(value);

	let showTitle = ! mxUtils.getValue(this.style, mxIBMShapeBase.prototype.cst.HIDE_HEADER, mxIBMShapeBase.prototype.cst.HIDE_HEADER_DEFAULT);	
	let marginTop = (showTitle) ? mxIBMShapeLegend.legendTitlebar : mxIBMShapeLegend.legendPadding;
  
	//let cellStyles = {'stackFill': isHorizontal ? 0 : 1, 'horizontalStack': isHorizontal ? 1 : 0, 'noLabel': showTitle ? 0 : 1 ,'marginTop': marginTop};
	let cellStyles = {'stackFill': isHorizontal ? 0 : 1, 'horizontalStack': isHorizontal ? 1 : 0, 'marginTop': marginTop};
   
	//return {isHorizontal, showTitle, marginTop, cellStyles};
	return {isHorizontal, marginTop, cellStyles};
};

mxIBMShapeLegend.prototype.getCellLayoutHeader = function(value)
{
	let showTitle = (value === '0');
	let marginTop = (showTitle) ? mxIBMShapeLegend.legendTitlebar : mxIBMShapeLegend.legendPadding;
  
	let cellStyles = {'noLabel': showTitle ? 0 : 1 ,'marginTop': marginTop};
   
	return {showTitle, marginTop, cellStyles};
};

mxIBMShapeLegend.prototype.getStyle = function(style, shapeType)
{
	let stylesForCells = this.getCellLayout(shapeType).cellStyles;  

	const Padding = 8;
	if (this.childCells != null) {
		for (let j = 0; j < this.childCells.length; j++) { 
			this.childCells[j].geometry.y = this.childCells[j].geometry.y + Padding * j
		}  
		geo = this.state.cell.geometry;
		geo.height = geo.height + (this.childCells.length - 1) * Padding;
	}
			
	for (let key in stylesForCells) 
		style = mxUtils.setStyle(style, key, stylesForCells[key]);

	return {style};
}

mxIBMShapeLegend.prototype.setCellStyles = function(graph, change) 
{
	let graphScale = graph.view.scale;

	let stylesForCells = this.getCellLayout(change).cellStyles;  

	let selectedCells = graph.getSelectionCells();

	for (let i = 0; i < selectedCells.length; i++)
	{
		let geo = graph.getCellGeometry(selectedCells[i]);
		let minParentWidth = 2 * mxIBMShapeLegend.legendPadding;
		let minParentHeight = stylesForCells.marginTop;

		let childCells = graph.getChildCells(selectedCells[i], true, false);
		for (let j = 0; j < childCells.length; j++)
		{
			let minChildWidth = graph.getCellBounds(childCells[j],true,false).width / graphScale + mxIBMShapeLegend.legendPadding + stylesForCells.marginTop;
			let minChildHeight = graph.getCellBounds(childCells[j],true,false).height / graphScale + mxIBMShapeLegend.legendPadding + stylesForCells.marginTop;

			minParentWidth = Math.max(minParentWidth,minChildWidth);	
			minParentHeight = Math.max(minParentHeight, minChildHeight);
		}
		
		geo.width = minParentWidth;
		geo.height = minParentHeight;
		graph.getModel().setGeometry(selectedCells[i], geo);
	}
			
	for (let key in stylesForCells)
		graph.setCellStyles(key, stylesForCells[key], selectedCells);
}

mxIBMShapeLegend.prototype.setCellStylesHeader = function(graph, change) 
{
	let graphScale = graph.view.scale;

	let stylesForCells = this.getCellLayoutHeader(change).cellStyles;  

	let selectedCells = graph.getSelectionCells();

	for (let key in stylesForCells)
		graph.setCellStyles(key, stylesForCells[key], selectedCells);
}

mxIBMShapeLegend.prototype.init = function(container)
{
	let ibmShapeAttributes = ['Legend-Title'];
	mxIBMShapeBase.prototype.addMissingAttribute(this.state.cell, ibmShapeAttributes);

	mxShape.prototype.init.apply(this, arguments); 

	this.cellID = this.state.cell.id;
	this.childCells = this.state.cell.children;
	this.handleEvents();
};

mxIBMShapeLegend.prototype.redraw = function()
{
	let childCells = this.state.cell.children;
	//let legendDimensions = mxIBMShapeLegend.prototype.getSizes(childCells, mxUtils.getValue(this.style, 'ibmLayout', 'verticalTitle'));
	let legendDimensions = mxIBMShapeLegend.prototype.getSizes(childCells, mxUtils.getValue(this.style, mxIBMShapeLegend.prototype.cst.SHAPE_TYPE, mxIBMShapeLegend.prototype.cst.SHAPE_TYPE_DEFAULT));
	let geo = this.state.cell.geometry;
	geo.width = legendDimensions.width;
	geo.height = legendDimensions.height;
	this.state.view.graph.model.setGeometry(this.state.cell, geo);

	mxShape.prototype.redraw.apply(this, arguments);
};

mxIBMShapeLegend.prototype.paintVertexShape = function(c, x, y, w, h)
{	
	var textColor = mxUtils.getValue(this.state.style, 'fontColor', 'none');
	var strokeColor = mxUtils.getValue(this.state.style, 'strokeColor', 'none');
	var fillColor = mxUtils.getValue(this.state.style, 'fillColor', 'none');

	c.translate(x, y);
	c.setFillColor(fillColor);
	c.setStrokeColor(strokeColor);
	c.rect(0, 0, w, h);
	c.fillAndStroke();

	fontColor = this.style.fontColor;
	if (fontColor != textColor && (-1 !== [ibmConfig.ibmColors.black, ibmConfig.ibmColors.gray, 'none'].indexOf(fontColor)))
	{
		this.style.fontColor = textColor;
		styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
		newStyle = mxUtils.setStyle(styleCurrent, 'fontColor', this.style.fontColor);
		this.state.view.graph.model.setStyle(this.state.cell, newStyle);
	}
};

mxIBMShapeLegend.prototype.getSizes = function(childCells, legendLayout)
{
	let stylesForLayout = this.getCellLayout(legendLayout);  

	const minWidth = 64;
	const minHeight = (stylesForLayout.showTitle) ? mxIBMShapeLegend.legendTitlebar + mxIBMShapeLegend.legendItemHeight + 2 * mxIBMShapeLegend.legendPadding : mxIBMShapeLegend.legendItemHeight + 2 * mxIBMShapeLegend.legendPadding; 

	let width = 2 * mxIBMShapeLegend.legendPadding;
	let height = stylesForLayout.marginTop;

	if (childCells != null)
	{
		for (let j = 0; j < childCells.length; j++)
		{
			if (stylesForLayout.isHorizontal)
			{
				width = width + childCells[j].geometry.width + mxIBMShapeLegend.legendPadding;
				height = minHeight;
			}
			else
			{
				width = Math.max(width, childCells[j].geometry.width + 2 * mxIBMShapeLegend.legendPadding);
				height = height + childCells[j].geometry.height + mxIBMShapeLegend.legendPadding;	
			}
		}	
	}

	width = Math.max(width, minWidth);
	height = Math.max(height, minHeight);

	return {width, height};
};

mxIBMShapeLegend.prototype.getLabelBounds = function(rect)
{
	const legendPadding = 8;
	const legendTitleHeight = 16;

	return new mxRectangle(rect.x + legendPadding * this.scale, 
				rect.y + legendPadding * this.scale,
				rect.width -  (2* legendPadding * this.scale),
				legendTitleHeight * this.scale);
};




//**********************************************************************************************************************************************************
// Deployment Units
//**********************************************************************************************************************************************************

function mxIBMShapeUnit(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};
 
mxUtils.extend(mxIBMShapeUnit, mxShape);
 
mxIBMShapeUnit.prototype.cst = ibmConfig.ibmUnitConstants;
 
mxIBMShapeUnit.prototype.customProperties = ibmConfig.ibmUnitProperties;

mxIBMShapeUnit.prototype.getProperties = function(shape)
{
	let labelHeight = 16;
	let labelAlign = 24;
	let hideIcon = false;
	let rotateIcon = 0;
	let iconColor = ibmConfig.ibmColors.black;
	let iconAlign = 0;
	let iconSize = 16;

	let lineColor = mxUtils.getValue(shape.state.style, mxIBMShapeBase.prototype.cst.LINE_COLOR, mxIBMShapeBase.prototype.cst.LINE_COLOR_DEFAULT);
	let fillColor = mxUtils.getValue(shape.state.style, mxIBMShapeBase.prototype.cst.FILL_COLOR, mxIBMShapeBase.prototype.cst.FILL_COLOR_DEFAULT);
	let fontColor = mxUtils.getValue(shape.state.style, mxIBMShapeBase.prototype.cst.FONT_COLOR, mxIBMShapeBase.prototype.cst.FONT_COLOR_DEFAULT);

	return {
		'labelHeight': labelHeight,
		'labelAlign': labelAlign,

		'hideIcon': hideIcon,
		'rotateIcon': rotateIcon,
		'iconColor': iconColor,
		'iconAlign': iconAlign,
		'iconSize': iconSize,

		'lineColor': lineColor,
		'fillColor': fillColor,
		'fontColor': fontColor
	}
}

mxIBMShapeUnit.prototype.init = function(container)
{
	let ibmShapeAttributes = ['Primary-Label', 'Secondary-Text'];
	mxIBMShapeBase.prototype.addMissingAttribute(this.state.cell, ibmShapeAttributes);

	mxShape.prototype.init.apply(this, arguments); 
};
 
mxIBMShapeUnit.prototype.redraw = function()
{
	this.shapeType = mxUtils.getValue(this.style, mxIBMShapeUnit.prototype.cst.SHAPE_TYPE, mxIBMShapeUnit.prototype.cst.SHAPE_TYPE_DEFAULT);
	 
	mxShape.prototype.redraw.apply(this, arguments);
};
 
 mxIBMShapeUnit.prototype.paintVertexShape = function(c, x, y, w, h)
{	
	let pop = this.shapeProperties = mxIBMShapeUnit.prototype.getProperties(this, this.shapeType);

	c.translate(x, y);
	 
	c.setFillColor(pop.fillColor);
	c.setStrokeColor(pop.strokeColor);
	c.rect(0, 0, w, h);
	c.fillAndStroke();
	 
	this.paintIcon(c);
 
	fontColor = this.style.fontColor;
	if (fontColor != pop.fontColor && (-1 !== [ibmConfig.ibmColors.black, ibmConfig.ibmColors.gray, 'none'].indexOf(fontColor)))
	{
		this.style.fontColor = pop.fontColor;
		styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
		newStyle = mxUtils.setStyle(styleCurrent, 'fontColor', this.style.fontColor);
		this.state.view.graph.model.setStyle(this.state.cell, newStyle);
	}
};

mxIBMShapeUnit.prototype.paintIcon = function(c)
{
	let pop = this.shapeProperties;

	if (!pop.hideIcon)
	{
		let positionX = pop.iconAlign;
		let positionY = pop.iconAlign;
 
		//let iconStencilName = this.shapeType.substring(2);
		let iconStencilName = "data";
		if (this.shapeType === "unitd")
			iconStencilName = "data";
		else if (this.shapeType === "unite")
			iconStencilName = "execution";
		else if (this.shapeType === "uniti")
			iconStencilName = "installation";
		else if (this.shapeType === "unitp")
			iconStencilName = "presentation";
		else if (this.shapeType === "unittd")
			iconStencilName = "technical--data";
		else if (this.shapeType === "unitte")
			iconStencilName = "technical--execution";
		else if (this.shapeType === "unitti")
			iconStencilName = "technical--installation";
		else if (this.shapeType === "unittp")
			iconStencilName = "technical--presentation";
 
		let iconStencil = null;

		iconStencil = mxStencilRegistry.getStencil('mxgraph.ibm.deployment-unit--' + iconStencilName);
 
		if (iconStencil == null)
			iconStencil = mxStencilRegistry.getStencil('mxgraph.ibm.undefined');
 
		if (iconStencil != null)
		{
			c.save();
			let canvasCenterX = positionX + pop.iconSize/2;
			let canvasCenterY = positionY + pop.iconSize/2;
		
			c.rotate(pop.rotateIcon, false, false, canvasCenterX, canvasCenterY);
			
			c.setStrokeColor('none');
			c.setFillColor(pop.iconColor);
			c.setDashed(false);

			iconStencil.strokewidth = 1;
			iconStencil.drawShape(c, this, positionX, positionY, pop.iconSize, pop.iconSize);	
			 
			c.restore();
		 }
	}
};
 
mxIBMShapeUnit.prototype.getLabelBounds = function(rect)
{
	let pop = this.shapeProperties;

	return new mxRectangle(rect.x + pop.labelAlign * this.scale, 
				rect.y,
				rect.width - (pop.labelAlign * this.scale),
				pop.labelHeight * this.scale);
};

mxCellRenderer.registerShape(mxIBMShapeBase.prototype.cst.SHAPE, mxIBMShapeBase);
mxCellRenderer.registerShape(mxIBMShapeLegend.prototype.cst.SHAPE, mxIBMShapeLegend);
mxCellRenderer.registerShape(mxIBMShapeUnit.prototype.cst.SHAPE, mxIBMShapeUnit);
