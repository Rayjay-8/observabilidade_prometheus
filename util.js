
function getRandom(array){
   const randomEl = array[Math.floor(Math.random() * array.length)];
   return randomEl
}

export function heavy(){

   const ms = getRandom([100, 200, 400, 500, 600, 700, 900, 1000, 1500]);
   const shouldThrowError = getRandom([1,2,3,4,5,6,7,8,9]) === 8
   if(shouldThrowError){
      const randomError = getRandom([
         "DB deu ruim",
         "Servidor desligado",
         "Acesso negado",
         "Not found"
      ])
      throw new Error(randomError)
   }

   return new Promise((resolve, reject) => setTimeout(() => resolve(ms), ms))
}