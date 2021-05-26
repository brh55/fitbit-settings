module.exports = api => {
    const isTest = api.env('test');
    // You can use isTest to determine what presets and plugins to use.
  
    if (isTest) {
        return {
            "presets": [
                [
                  "@babel/preset-env",
                  {
                    "targets": {
                        "esmodules": true
                    }
                  }
                ]
            ]
        }
    }

    return {
        "presets": [
            [
              "@babel/preset-env",
              {
                "modules": false
              }
            ]
        ]
    };
};