require('dotenv').config()
const { override, addWebpackAlias, addWebpackPlugin } = require('customize-cra')
const path = require('path')
const DefinePlugin = require('webpack').DefinePlugin

module.exports = override(
    addWebpackAlias({
        ['@']: path.resolve(__dirname, 'src'),
    }),
    addWebpackPlugin(
        new DefinePlugin({
            'process.env.OPENAI_API_KEY': JSON.stringify(
                process.env.OPENAI_API_KEY
            ),
            'process.env.ENDPOINT': JSON.stringify(process.env.ENDPOINT),
            'process.env.DEPLOYMENT_NAME': JSON.stringify(
                process.env.DEPLOYMENT_NAME
            ),
            'process.env.MODEL_NAME': JSON.stringify(process.env.MODEL_NAME),
        })
    )
)
