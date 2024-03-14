import express from "express"
import { heavy } from "./util.js"
import client from "prom-client"
import responseTime from "response-time"
import LokiTransport from "winston-loki";
import { createLogger } from "winston";

const options = {
   transports: [
     new LokiTransport({
      labels: {
         appName: "express"
      },
       host: "http://127.0.0.1:3100"
     })
   ]
 };
 const logger = createLogger(options);

const app = express()
const PORT = 8000

const collectDefaultMetrics = client.collectDefaultMetrics;

const reqResTime = new client.Histogram({
   name: "http_express_req_res_time",
   help:"Tempo que cada requisição levou!",
   labelNames: ['method', 'route', 'status_code'],
   buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000]
})

app.use(responseTime((req, res, time) => {
   reqResTime.labels({
      method: req.method,
      route: req.url,
      status_code: res.statusCode
   }).observe(time)
}))


console.log(collectDefaultMetrics.metricsList)

collectDefaultMetrics({register: client.register})

app.get("/", async (req, res) => {
   logger.info("Req came on / router")
   return res.json({"hellow": new Date()})
})

app.get("/slow", async (req, res) => {
   try {
      logger.info("Req came on /slow router")
      const timetaken = await heavy();
      return res.json({
         status: "Sucesso",
         message: "Heavy task completed in "+timetaken+"ms"
      })
      
   } catch (error) {
      logger.error(error.message)
      return res.status(500).json({
         status: "Error",
         error: "Erro interno no servidor"
      })
   }
})

app.get('/metrics', async (req, res) => {
   res.setHeader('Content-Type', client.register.contentType);
   const metrics = await client.register.metrics();
   res.send(metrics);
} )

app.listen(PORT, () => console.log(`rodando em http://localhost:${PORT}`))