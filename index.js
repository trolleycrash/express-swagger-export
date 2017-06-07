/* jshint node:true, esversion:6 */
module.exports = function express4toSwagger2(app, filepath, options = {
	includeRoot: true
}) {
	let template = {
		swagger: "2.0",
		info: {
			title: 'Swagger app',
			description: 'Swagger app description',
		},
		"paths": {}
	};
	template = Object.assign(template, options.template);

    var route, routes = [];

    app._router.stack.forEach(function(middleware){
        if(middleware.route){ // routes registered directly on the app
            routes.push(middleware.route);
        } else if(middleware.name === 'router'){ // router middleware
            middleware.handle.stack.forEach(function(handler){
                route = handler.route;
                route && routes.push(route);
            });
        }
    });

	// export all files
	routes.forEach(r => {
		const last = r.stack[r.stack.length-1];
		var method = last.method;
		keys = last.keys;
		// ignore non-string paths
		if (typeof r.path !== 'string') {
			return;
		}
		if ((r.path === '/' || r.path === '/*') && !options.includeRoot) {
			return;
		}
		let endpointPath = JSON.parse(JSON.stringify(r.path));
		endpointPath = endpointPath.replace(/:([^\/]+)/g, '{$1}');
		// keys.forEach(key => {
		// 	// replace optional and required params
		// 	endpointPath = endpointPath.replace(`?:${key.name}`, `{${key.name}}`).replace(`:${key.name}`, `{${key.name}}`);
		// });
		// create endpoint if not exists
		if (!template.paths[endpointPath]) {
			template.paths[endpointPath] = {};
		}
		template.paths[endpointPath][method] = {
			"responses": {
				"200": {
					"description": `${method} ${endpointPath}`
				}
			}
		}
	})
	const fs = require('fs');
	fs.writeFile(filepath, JSON.stringify(template, null, 2));
	console.log(`express-swagger-export: API exported to ${filepath} file`);
}
