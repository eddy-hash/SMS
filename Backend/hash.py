from fastapi import FastAPI
from passlib.context import CryptContext
from pydantic import BaseModel

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")    


class hashing(BaseModel):
      password: str
      hashed_password: str

password = 'student123'   

hashed_password = pwd_context.hash(password)

print("password is :", password)
print("hashed_password is :", hashed_password)


     
 
