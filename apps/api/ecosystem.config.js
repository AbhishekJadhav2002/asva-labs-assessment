export default {
    apps: [
        {
            time: true,
            watch: false,
            max_restarts: 10,
            min_uptime: '10s',
            exec_mode: 'cluster',
            out_file: 'logs/out.log',
            max_memory_restart: '1G',
            script: 'build/server.js',
            error_file: 'logs/err.log',
            log_file: 'logs/combined.log',
            name: 'project-management-api',
            node_args: '--max-old-space-size=1024',
            ignore_watch: ['node_modules', 'logs'],
            instances: process.env['NODE_ENV'] === 'production' ? 'max' : 1,
            env: {
                PORT: 3001,
                NODE_ENV: 'development',
            },
            env_production: {
                PORT: 3001,
                NODE_ENV: 'production',
            },
        },
    ],
};