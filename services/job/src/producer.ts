import {Kafka, Producer, Admin, Partitioners} from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

let producer: Producer;
let admin: Admin;

export const connectProducer = async () => {
    try {
        const kafka = new Kafka({
            clientId: 'auth-service',
            brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
        });
        admin = kafka.admin();
        await admin.connect();
        
        const topics = await admin.listTopics();
        if(!topics.includes('send-mail')){
            await admin.createTopics({
                topics: [
                    {
                        topic: 'send-mail',
                        numPartitions: 1,
                        replicationFactor: 1,
                    }
                ],
            });
            console.log('Topic send-mail created');
        }
        await admin.disconnect();

        producer = kafka.producer({
            createPartitioner: Partitioners.LegacyPartitioner     //to silence the KafkaJS v2 warning
        });
        await producer.connect();

        console.log('-----Kafka producer connected-----');
    }
    catch(error){
        console.error('Error connecting Kafka producer:', error);
    }
};

export const publishToTOpic = async (topic: string, message: any)=> {
    if(!producer){
        console.error('Producer not connected');
        return;
    }
    try{
        await producer.send({
            topic,
            messages: [
                { value: JSON.stringify(message) }
            ],
        });
    } catch (error) {
        console.error('Error publishing message:', error);
    }
}

export const disconnectProducer = async () => {
    try {
        if (producer) {
            await producer.disconnect();
            console.log('Kafka producer disconnected');
        }
    } catch (error) {
        console.error('Error disconnecting Kafka producer:', error);
    }
};